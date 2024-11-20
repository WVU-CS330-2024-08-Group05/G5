import sys
import json
from pystac_client import Client
from planetary_computer import sign
import rioxarray  # Use rioxarray to load GeoTIFF files
import math  # Import math to check for NaN

# Constants for the STAC API
STAC_API_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION_ID = "MODIS Snow Cover 5-Min L2 Swath 500m"
COLLECTION = json.load('./ModisSnowCoverDaily.json')
"""BBOX = [-82.644739, 37.201483, -77.719519, 40.638801]  # Bounding box for West Virginia"""
BBOX = [-85.0, 35.0, -75.0, 42.0]  # Bounding box for West Virginia and surrounding area
"""BBOX = [-125.0, 24.396308, -66.93457, 49.384358]  # Approximate bounding box for the contiguous USA"""
MAX_POINTS = 50000  # Maximum number of points to process

def get_location_data(coords):
    """
    Fetches weather data for a given location.
    
    Args:
        coords (str): Coordinates in (x.xx,x.xx) format.
        
    Returns:
        list[dict]: A list of dictionaries, each containing latitude, longitude, and tavg.
    """
    
    print("Initializing STAC client...", file=sys.stderr)  # Log to stderr
    client = Client.open(STAC_API_URL)

    search = client.search(
        collections=[COLLECTION_ID],
        )













def main(coords):
    """
    Main function to fetch and print weather data for given location in json.
    
    Args:
        coords (string) coordinates in form (x.xx,x.xx)
    """
    print(f"Starting data retrieval for coordinates: {coords}", file=sys.stderr)
    data = get_location_data(coords)
    print(json.dumps(data))  # Only output JSON data to stdout

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_location_data.py <date>", file=sys.stderr)
        sys.exit(1)

    coords = sys.argv[1]
    main(coords)