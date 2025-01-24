from flask import Flask, jsonify, render_template, request, url_for, session
import networkx as nx
import pandas as pd
import math
from graph_generation import load_graph_from_csv, assign_positions

app = Flask(__name__)
app.secret_key = "your-secret-key"


resource_data = {
        "Name": resource_name, 
        "Type": resource_type,
        "Latitude": resource_lat, 
        "Longitude": resource_long,
        "Link": resource_link
    }

@app.route('/')
def index():
    # Read the CSV file
    df = pd.read_csv('data/info-data.csv')
    
    # Build the resource_data dictionary
    csv_data = [
        {
            "Name": row['Name'], 
            "Type": row['Type'], 
            "Latitude": row['Latitude'], 
            "Longitude": row['Longitude'], 
            "Link": row['Link']
        }
        for _, row in df.iterrows()
    ]
    # Pass the JSON data to the template
    return render_template('node-link/node-link.html', resource_data=csv_data)


# Function to find the closest node based on latitude and longitude
def find_closest_node(lat, lon, csv_path):
    try:
        df = pd.read_csv(csv_path, index_col=0)  # Set the first column as the index
    except FileNotFoundError:
        print(f"[ERROR] CSV file not found at path: {csv_path}")
        return None
    except pd.errors.EmptyDataError:
        print(f"[ERROR] CSV file at path {csv_path} is empty.")
        return None
    except Exception as e:
        print(f"[ERROR] An error occurred while reading CSV: {e}")
        return None

    closest_node = None
    min_distance = float("inf")

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        print(f"[ERROR] Invalid latitude or longitude values: lat={lat}, lon={lon}")
        return None

    for index, row in df.iterrows():
        try:
            node_lat = float(row["lat"])
            node_lon = float(row["long"])
            distance = math.sqrt((lat - node_lat) ** 2 + (lon - node_lon) ** 2)
            if distance < min_distance:
                min_distance = distance
                closest_node = index  # Use the index as the node identifier
        except (ValueError, KeyError) as e:
            print(f"[WARNING] Skipping row {index} due to error: {e}")
            continue

    if closest_node is None:
        print("[WARNING] No closest node found.")
    return closest_node


# Function to generate graph data
def generate_graph_data(lat, lon, csv_path="data/test-data.csv", top_n=8, depth_k=1):
    main_node = find_closest_node(lat, lon, csv_path)
    if main_node is None:
        print("[ERROR] Main node not found. Cannot generate graph data.")
        return None

    try:
        G = load_graph_from_csv(csv_path, main_node, top_n, depth_k)
        positions = assign_positions(G, main_node)
    except Exception as e:
        print(f"[ERROR] An error occurred while generating the graph: {e}")
        return None

    node_x = [pos[0] for pos in positions.values()]
    node_y = [pos[1] for pos in positions.values()]

    node_index = []
    node_name = []
    node_lat = []
    node_long = []
    node_strata = []
    for node in G.nodes():
        node_index.append(node)
        node_name.append(G.nodes[node].get("name", None))
        node_lat.append(G.nodes[node].get("lat", None))
        node_long.append(G.nodes[node].get("long", None))
        node_strata.append(G.nodes[node].get("strata", None))

    edge_x = []
    edge_y = []
    edge_weights = []
    for edge in G.edges():
        try:
            x0, y0 = positions[edge[0]]
            x1, y1 = positions[edge[1]]
            edge_x += [x0, x1]
            edge_y += [y0, y1]

            weight = G.edges[edge].get("weight", 1)
            edge_weights.append(weight)
        except KeyError as e:
            print(f"[WARNING] Missing position for edge {edge}: {e}")
            continue

    graph_data = {
        "nodes": {
            "index": node_index,
            "x": node_x,
            "y": node_y,
            "name": node_name,
            "lat": node_lat,
            "lon": node_long,
            "strata": node_strata,
        },
        "edges": {
            "x": edge_x,
            "y": edge_y,
            "nodes": [node for tup in list(G.edges) for node in tup],
            "weights": edge_weights,
            "line_color": "rgba(0,0,0, 0.2)",
        },
        "main_node": main_node,
    }

    return graph_data


# Route to render the search page
@app.route("/")
def search_page():
    return render_template("searchpage/searchpage.html")


# Route to handle the graph generation based on lat/long
@app.route("/graph", methods=["POST"])
def display_graph():
    lat = request.form.get("latitude")
    lon = request.form.get("longitude")

    print(
        f"[DEBUG] /graph POST received - latitude: {lat}, longitude: {lon}"
    )  # Debugging

    graph_data = generate_graph_data(lat, lon)

    if not graph_data:
        return "No valid node found. Please try again with a different location.", 400
    session["graph_data"] = graph_data

    return render_template("node-link/node-link.html", graph_data=graph_data)


@app.route("/graph-data")
def serve_graph_data():
    graph_data = session.get("graph_data")
    if not graph_data:
        return "Graph data not found. Generate it first.", 404
    return jsonify(graph_data)


if __name__ == "__main__":
    app.run(debug=True)
