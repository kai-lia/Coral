from flask import Flask, jsonify, render_template, request
import networkx as nx
import pandas as pd
import math
from graph_generation import load_graph_from_csv, assign_positions

app = Flask(__name__)

# Function to find the closest node based on latitude and longitude
def find_closest_node(lat, lon, csv_path):
    df = pd.read_csv(csv_path, index_col=0)  # Set the first column as the index
    closest_node = None
    min_distance = float('inf')

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return None

    for index, row in df.iterrows():
        try:
            node_lat = float(row['lat'])
            node_lon = float(row['long'])
            distance = math.sqrt((lat - node_lat) ** 2 + (lon - node_lon) ** 2)
            if distance < min_distance:
                min_distance = distance
                closest_node = index  # Use the index as the node identifier
        except (ValueError, KeyError):
            continue

    return closest_node

# Route to render the search page
@app.route("/")
def search_page():
    return render_template("searchpage.html")

# Route to handle the graph generation based on lat/long
@app.route("/graph", methods=["POST"])
def display_graph():
    lat = request.form.get("latitude")
    lon = request.form.get("longitude")

    # Path to the CSV file
    csv_path = "data/test-data.csv"
    main_node = find_closest_node(lat, lon, csv_path)

    if not main_node:
        return "No valid node found. Please try again with a different location.", 400

    # Generate the graph data using the closest node as the main node
    top_n = 8
    depth_k = 1
    G = load_graph_from_csv(csv_path, main_node, top_n, depth_k)
    positions = assign_positions(G, main_node)

    node_x = [pos[0] for pos in positions.values()]
    node_y = [pos[1] for pos in positions.values()]

    node_index = []
    node_name = []
    node_lat = []
    node_long = []
    for node in G.nodes():
        node_index.append(node)
        node_name.append(G.nodes[node].get("name", None))
        node_lat.append(G.nodes[node].get("lat", None))
        node_long.append(G.nodes[node].get("long", None))

    edge_x = []
    edge_y = []
    edge_weights = []
    for edge in G.edges():
        x0, y0 = positions[edge[0]]
        x1, y1 = positions[edge[1]]

        edge_x += [x0, x1, None]
        edge_y += [y0, y1, None]

        weight = G.edges[edge].get("weight", 1)
        edge_weights.append(weight)

    graph_data = {
        "nodes": {
            "index": node_index,
            "x": node_x,
            "y": node_y,
            "name": node_name,
            "lat": node_lat,
            "lon": node_long,
        },
        "edges": {
            "x": edge_x,
            "y": edge_y,
            "weights": edge_weights,
            "line_color": "rgba(0,0,0, 0.2)",
        },
        "main_node": main_node,
    }

    return render_template("node-link.html", graph_data=graph_data)

# Route to provide graph data in JSON format
@app.route("/graph-data")
def graph_data():
    return jsonify(graph_data)

if __name__ == "__main__":
    app.run(debug=True)
