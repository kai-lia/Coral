import math
import pandas as pd
import networkx as nx
import numpy as np
import random
import matplotlib.pyplot as plt


def load_graph_from_csv(file_path, main_node, top_n, depth_k):
    def get_top_n_similar_nodes(node, top_n):
        scores = df.loc[[node], similarity_columns]
        scores = scores.dropna(axis=1)
        scores = scores.iloc[0]
        # Ensure we only get top neighbors if enough scores are available
        if len(scores) == 0:
            return []
        top_neighbors = scores.nlargest(min(top_n, len(scores))).index.tolist()
        return [neighbor.replace(" score", "") for neighbor in top_neighbors]

    df = pd.read_csv(file_path, index_col=0)
    similarity_columns = [col for col in df.columns if "score" in col.lower()]

    for col in similarity_columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    G = nx.Graph()
    for node in df.index:
        lat = df.at[node, "lat"]
        long = df.at[node, "long"]
        name = df.at[node, "name"]
        G.add_node(node, index=node, lat=lat, long=long, name=name)

    queue = [(main_node, 0)]
    visited = set()
    while queue:
        current_node, current_depth = queue.pop(0)
        if current_node not in visited and current_depth <= depth_k:
            visited.add(current_node)
            top_neighbors = get_top_n_similar_nodes(current_node, top_n)
            for neighbor in top_neighbors:
                similarity_score = df.loc[current_node, f"{neighbor} score"]
                G.add_edge(current_node, neighbor, weight=similarity_score)
                if neighbor not in visited and current_depth + 1 <= depth_k:
                    queue.append((neighbor, current_depth + 1))

    # Remove unconnected nodes
    G.remove_nodes_from(list(nx.isolates(G)))
    return G


def assign_positions(G, main_node, min_distance=0.1, min_angle_deg=30):
    positions = {}
    positions[main_node] = (random.uniform(0, 1), random.uniform(0, 1))
    placed_angles = []

    def is_valid_position(new_pos):
        for pos in positions.values():
            distance = math.sqrt(
                (new_pos[0] - pos[0]) ** 2 + (new_pos[1] - pos[1]) ** 2
            )
            if distance < min_distance:
                return False
        return True

    def is_valid_angle(new_angle):
        for angle in placed_angles:
            if abs(new_angle - angle) < min_angle_deg:
                return False
        return True

    for node in G.nodes:
        if node != main_node:
            valid_position = False
            while not valid_position:
                angle = random.uniform(0, 360)
                radius = random.uniform(min_distance, 1)

                # Convert polar coordinates to Cartesian coordinates
                x_main, y_main = positions[main_node]
                new_x = x_main + radius * math.cos(math.radians(angle))
                new_y = y_main + radius * math.sin(math.radians(angle))

                new_pos = (new_x, new_y)

                if is_valid_position(new_pos) and is_valid_angle(angle):
                    valid_position = True
                    placed_angles.append(angle)

            positions[node] = new_pos

    return positions


if __name__ == "__main__":
    main_node = "node 1"
    top_n = 8
    depth_k = 1

    graph = load_graph_from_csv("data/test-data.csv", main_node, top_n, depth_k)
    positions = assign_positions(graph, main_node)

    plt.figure(figsize=(10, 7))
    nx.draw(
        graph,
        positions,
        with_labels=True,
        node_color="skyblue",
        node_size=700,
        font_size=12,
        font_weight="bold",
    )
    nx.draw_networkx_edge_labels(
        graph,
        positions,
        edge_labels={
            (u, v): f"{d['weight']:.2f}" for u, v, d in graph.edges(data=True)
        },
    )
    plt.title("Graph Visualization with Nodes and Similarity Scores")
    plt.show()
