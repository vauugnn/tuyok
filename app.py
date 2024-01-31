from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def calculate_fare():
    fare = None  # Initialize fare for initial page load

    if request.method == "POST":
        distance = int(request.form.get('enter_destination'))
        apply_discount = request.form['discount'] == 'on'

        if apply_discount:
            fare = calculate_fare_with_discount(distance)
        else:
            fare = calculate_fare_regular(distance)

    return render_template("index.html", fare=fare)

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
