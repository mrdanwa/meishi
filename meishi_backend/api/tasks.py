from celery import shared_task
from datetime import datetime, timedelta
from django.db import transaction
from api.models.booking.general_time_slot import GeneralTimeSlot
from api.models.booking.time_slot import TimeSlot
import logging

logger = logging.getLogger(__name__)

@shared_task
def create_timeslots_for_one_day():
    """
    Create TimeSlots for one specific day based on all GeneralTimeSlot entries.
    """
    today = datetime.today().date()
    target_date = today + timedelta(days=30)
    timeslots_to_create = []

    try:
        # Use a transaction to ensure atomicity
        with transaction.atomic():
            # Fetch all GeneralTimeSlot entries for the target weekday
            general_time_slots = GeneralTimeSlot.objects.filter(weekday=target_date.weekday()).values(
                'id', 'booking_system', 'start_time', 'end_time', 'interval_minutes',
                'max_people', 'max_tables', 'min', 'max'
            )
            logger.info(f"Fetched {len(general_time_slots)} GeneralTimeSlot entries for weekday {target_date.weekday()}.")

            # Pre-fetch existing TimeSlot entries for the target date
            existing_timeslots = set(
                TimeSlot.objects.filter(date=target_date).values_list('time', flat=True)
            )
            logger.info(f"Pre-fetched {len(existing_timeslots)} existing TimeSlot entries for {target_date}.")

            for general_time_slot in general_time_slots:
                current_time = datetime.combine(target_date, general_time_slot['start_time'])
                end_time = datetime.combine(target_date, general_time_slot['end_time'])

                while current_time.time() <= end_time.time():
                    # Check if the time already exists
                    if current_time.time() not in existing_timeslots:
                        # Append a new TimeSlot for bulk creation
                        timeslots_to_create.append(TimeSlot(
                            booking_system_id=general_time_slot['booking_system'],
                            general_timeslot_id=general_time_slot['id'],
                            date=target_date,
                            time=current_time.time(),
                            max_people=general_time_slot['max_people'],
                            max_tables=general_time_slot['max_tables'],
                            min=general_time_slot['min'],
                            max=general_time_slot['max'],
                        ))

                    # Increment by interval
                    current_time += timedelta(minutes=general_time_slot['interval_minutes'])

            # Bulk create new TimeSlots
            if timeslots_to_create:
                TimeSlot.objects.bulk_create(timeslots_to_create)
                logger.info(f"Successfully created {len(timeslots_to_create)} TimeSlots for {target_date}.")
            else:
                logger.info(f"No new TimeSlots needed for {target_date}.")

    except Exception as e:
        logger.error(f"Error creating TimeSlots for {target_date}: {str(e)}", exc_info=True)

from celery import shared_task
from datetime import timedelta
from django.utils.timezone import now
from api.models.restaurant import Restaurant
from api.models.dish import Dish
import logging

logger = logging.getLogger(__name__)

@shared_task
def update_restaurant_weekly_counts():
    """
    Update weekly like counts for all restaurants.
    """
    try:
        for restaurant in Restaurant.objects.all():
            restaurant.update_weekly_like_count()
        logger.info("Successfully updated weekly like counts for all restaurants.")
    except Exception as e:
        logger.error(f"Error updating restaurant weekly like counts: {str(e)}", exc_info=True)

@shared_task
def update_dish_weekly_counts():
    """
    Update weekly like counts for all dishes.
    """
    try:
        for dish in Dish.objects.all():
            dish.update_weekly_like_count()
        logger.info("Successfully updated weekly like counts for all dishes.")
    except Exception as e:
        logger.error(f"Error updating dish weekly like counts: {str(e)}", exc_info=True)
