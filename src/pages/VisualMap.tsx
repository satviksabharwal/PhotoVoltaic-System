import { Container } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { Product } from "../types/models";
import locationIcon from "./location.png";
import "./VisualMap.css";

// ----------------------------------------------------------------------

interface VisualMapProps {
  productData?: Product[];
}

const VisualMap = ({ productData }: VisualMapProps) => (
  <>
    <Container maxWidth={false} style={{ padding: "0px" }}>
      <MapContainer
        center={[50.8282, 12.9209] as LatLngExpression}
        zoom={4}
        scrollWheelZoom={false}
        style={{ borderRadius: "1%", height: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {productData && productData.length > 0 ? (
          productData.map((product) => (
            <Marker position={[product?.latitude, product?.longitude] as LatLngExpression} key={product?.id}>
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
