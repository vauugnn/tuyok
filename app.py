from flask import Flask, render_template, request, jsonify
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def calculate_fare():
    fare = None  # Initialize fare for initial page load

    # Set default coordinates for Davao City
    geolocator = Nominatim(user_agent="FareCalculator (myemail@example.com)")
    location = geolocator.geocode("Davao City")
    coords = [location.latitude, location.longitude]

    # Get the coordinates of the two points
    point_a = (51.7519, -1.2578)
    point_b = (50.8429, -0.1313)

    # Calculate the distance between the two points in kilometers
    distance = geodesic(point_a, point_b).kilometers

    if request.method == "POST":
        apply_discount = request.form.get('discount') == 'on'

        if distance and apply_discount:
            fare = calculate_fare_with_discount(distance)
        elif distance:
            fare = calculate_fare_regular(distance)
    return render_template("index.html", fare=fare, coords=coords, distance=distance, point_a=point_a, point_b=point_b)


@app.route('/distance', methods=['GET'])
def get_distance():
    point_a = (51.7519, -1.2578)
    point_b = (50.8429, -0.1313)
    distance = geodesic(point_a, point_b).miles
    print(distance)
    return jsonify({'distance': distance})

@app.route('/map', methods=['GET'])
def map():
    geolocator = Nominatim(user_agent="FareCalculator (vaughnrochederoda@gmail.com)")
    location = geolocator.geocode("Davao City")
    return render_template("index.html", coords=[location.latitude, location.longitude])

@app.route('/calculate_fare', methods=['POST'])
def calculate_fare_post():
    distance = float(request.form.get('distance'))  # Get the distance from the form
    apply_discount = request.form.get('discount') == 'on'

    if apply_discount:
        fare = calculate_fare_with_discount(distance)
    else:
        fare = calculate_fare_regular(distance)

    return jsonify({'fare': 'Your fare is: ₱' + str(fare)})

def calculate_fare_regular(distance):
    if distance <= 4:
        return 15
    else:
        return 15 + (distance - 4) * 2

def calculate_fare_with_discount(distance):
    regular_fare = calculate_fare_regular(distance)
    return int((regular_fare * 0.8))

if __name__ == "__main__":
    app.run(debug=True)