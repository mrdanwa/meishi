# api/pagination.py
from rest_framework.pagination import PageNumberPagination

class DefaultPagination(PageNumberPagination):
    page_size = 18  # Default number of items per page
    page_size_query_param = 'page_size'  # Allow the client to set the page size
    max_page_size = 100  # Maximum number of items per page
