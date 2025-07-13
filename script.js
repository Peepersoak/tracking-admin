const socket = io("http://127.0.0.1:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("update_location", (data) => {
  console.log(data);
  updateVehicleRoute(data);
});

socket.emit("info", {
  role: "admin",
});

let myCoordinate = [0, 0];
var map = L.map("map").setView(myCoordinate, 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// This will get and pan to the location
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      myCoordinate = [latitude, longitude];
      map.panTo(myCoordinate);
    },
    (error) => {
      console.error("❌ Geolocation error:", error.message);
    }
  );
} else {
  alert("Geolocation is not supported by your browser.");
}

const vehicleRoutes = {};
function updateVehicleRoute(vehicles) {
  for (const vehicle of vehicles) {
    const plateNubmer = vehicle.plateNubmer;
    const location = vehicle.location;
    const active = vehicle.active ?? false;

    console.log("LOCATION");
    console.log(location);
    console.log("ACTIVE: " + active);

    const current = L.latLng(location.current, location.current);
    const destination = L.latLng(location.destination, location.destination);

    if (
      (location.current[0] == 0 && location.current[1] == 0) ||
      (location.destination[0] == 0 && location.destination[1] == 0)
    )
      return;

    const opacity = active ? 0.9 : 0.2;

    if (vehicleRoutes[plateNubmer]) {
      vehicleRoutes[plateNubmer].setWaypoints([current, destination]);
      return;
    }

    // Create a new route
    const routingControl = L.Routing.control({
      waypoints: [current, destination],
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: getRandomColor(), opacity: opacity, weight: 5 }],
      },
    }).addTo(map);
    vehicleRoutes[plateNubmer] = routingControl;
  }
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
