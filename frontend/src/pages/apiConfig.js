let API_BASE_URL;


if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {

  API_BASE_URL = "http://localhost:5000";
} else {

  API_BASE_URL = `http://${window.location.hostname}:5000`;
}

export default API_BASE_URL;
