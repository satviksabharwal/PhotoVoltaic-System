import { Container, Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet-async";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "./VisualMap.css";

const position = [
  [50.8282, 12.9209],
  [52.52, 13.405],
];
const VisualMap = () => (
  <>
    <Helmet>
      <title> Dashboard: Visual Map </title>
    </Helmet>
    <Container maxWidth="l">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Visual Map
      </Typography>
      <MapContainer center={[50.8282, 12.9209]} zoom={10} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position.map((pos, index) => (
          <Marker position={pos} key={index} />
        ))}
      </MapContainer>
    </Container>
  </>
);
//  <Marker position={[pos[0], pos[1]]} key={index} />;
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
});
L.Marker.prototype.options.icon = DefaultIcon;
export default VisualMap;
