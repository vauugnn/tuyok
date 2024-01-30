from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def calculate_fare():
    if request.method == "POST":
        distance = request.form["enter_destination"]
        distance2 = int(distance)
        if distance2 <= 4:
            fare = 15
        else:
            fare = 15 + (distance2 - 4) * 2
        return render_template("index.html", fare=fare)
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
