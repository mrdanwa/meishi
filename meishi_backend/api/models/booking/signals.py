from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from datetime import datetime, timedelta
from api.models.booking.general_time_slot import GeneralTimeSlot
from api.models.booking.time_slot import TimeSlot
from django.db import transaction

@receiver(post_save, sender=GeneralTimeSlot)
def handle_general_time_slot_save(sender, instance, created, **kwargs):
    """
    Signal to handle creation or update of TimeSlots when a GeneralTimeSlot is saved.
    """
    if created:
        # New GeneralTimeSlot: Create TimeSlots for the next 30 days
        create_timeslots_for_next_30_days(instance)
    else:
        # Updated GeneralTimeSlot: Recreate TimeSlots for the next 30 days
        with transaction.atomic():
            existing_timeslots = TimeSlot.objects.filter(general_timeslot=instance)
            # Delete timeslots without bookings
            existing_timeslots.filter(bookings=None).delete()
            # Set `is_open=False` for timeslots with bookings
            existing_timeslots.exclude(bookings=None).update(is_open=False)

            # Recreate TimeSlots for the next 30 days
            create_timeslots_for_next_30_days(instance)

@receiver(pre_delete, sender=GeneralTimeSlot)
def handle_general_time_slot_delete(sender, instance, **kwargs):
    """
    Signal to handle deletion of TimeSlots when a GeneralTimeSlot is deleted.
    """
    with transaction.atomic():
        timeslots = TimeSlot.objects.filter(general_timeslot=instance)
        # Delete timeslots without bookings
        timeslots.filter(bookings=None).delete()
        # Set `is_open=False` for timeslots with bookings
        timeslots.exclude(bookings=None).update(is_open=False)

def create_timeslots_for_next_30_days(general_time_slot):
    """
    Helper function to create TimeSlots for the next 30 days based on a GeneralTimeSlot.
    """
    today = datetime.today().date()
    timeslots_to_create = []

    with transaction.atomic():
        for single_date in (today + timedelta(days=n) for n in range(30)):
            if single_date.weekday() == general_time_slot.weekday:
                current_time = datetime.combine(single_date, general_time_slot.start_time)
                end_time = datetime.combine(single_date, general_time_slot.end_time)

                while current_time <= end_time:
                    existing_timeslot = TimeSlot.objects.filter(
                        booking_system=general_time_slot.booking_system,
                        date=single_date,
                        time=current_time.time()
                    ).first()

                    if existing_timeslot:
                        # Link existing TimeSlot to this GeneralTimeSlot
                        existing_timeslot.general_timeslot = general_time_slot
                        existing_timeslot.is_open = True  # Ensure it's open
                        existing_timeslot.save()
                    else:
                        # Create a new TimeSlot
                        timeslots_to_create.append(TimeSlot(
                            booking_system=general_time_slot.booking_system,
                            general_timeslot=general_time_slot,
                            date=single_date,
                            time=current_time.time(),
                            max_people=general_time_slot.max_people,
                            max_tables=general_time_slot.max_tables,
                            min=general_time_slot.min,
                            max=general_time_slot.max
                        ))

                    current_time += timedelta(minutes=general_time_slot.interval_minutes)

    # Bulk create new TimeSlots
    if timeslots_to_create:
        TimeSlot.objects.bulk_create(timeslots_to_create)
