import { Container } from "@mui/material";
import React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import locationIcon from "./location.png";
import "./VisualMap.css";

const VisualMap = (productData) => (
  <>
    <Container maxWidth="l" style={{ padding: "0px" }}>
      <MapContainer
        center={[50.8282, 12.9209]}
        zoom={4}
        scrollWheelZoom={false}
        style={{ borderRadius: "1%", height: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {productData?.productData?.length > 0 ? (
          productData?.productData?.map((product) => (
            <Marker position={[product?.latitude, product?.longitude]} key={product?.id}>
              <Popup>
                <h3 style={{ textAlign: "center" }}>{product?.name}</h3>
              </Popup>
            </Marker>
          ))
        ) : (
          <></>
        )}
      </MapContainer>
    </Container>
  </>
);

const DefaultIcon = L.icon({
  iconUrl: locationIcon,
  iconSize: [36, 36],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});
L.Marker.prototype.options.icon = DefaultIcon;
export default VisualMap;
