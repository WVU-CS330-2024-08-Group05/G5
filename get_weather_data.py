import sys
import json
from pystac_client import Client
from planetary_computer import sign
import rioxarray  # Use rioxarray to load GeoTIFF files
import math  # Import math to check for NaN

# Constants for the STAC API
STAC_API_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION_ID = "MODIS Snow Cover 5-Min L2 Swath 500m"
"""BBOX = [-82.644739, 37.201483, -77.719519, 40.638801]  # Bounding box for West Virginia"""
BBOX = [-85.0, 35.0, -75.0, 42.0]  # Bounding box for West Virginia and surrounding area
"""BBOX = [-125.0, 24.396308, -66.93457, 49.384358]  # Approximate bounding box for the contiguous USA"""
MAX_POINTS = 50000  # Maximum number of points to process



















def main(date):
    """
    Main function to fetch and print data for a given date.
    
    Args:
        date (str): The date in YYYY-MM-DD format.
    """
    print(f"Starting data retrieval for date: {date}", file=sys.stderr)
    data = get_temperature_data(date)
    print(json.dumps(data))  # Only output JSON data to stdout

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_temperature_data.py <date>", file=sys.stderr)
        sys.exit(1)

    input_date = sys.argv[1]
    main(input_date)