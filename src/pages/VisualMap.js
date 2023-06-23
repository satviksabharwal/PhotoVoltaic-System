import { Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import L from "leaflet";
import { selectCurrentUser } from "../store/user/user.selector";
import "./VisualMap.css";

const VisualMap = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [productData, setProductData] = useState();

  const getAllProductData = () => {
    try {
      const url = `http://localhost:5500/api/product`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      axios.get(url, config).then(
        (response) => {
          setProductData(response.data);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getAllProductData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard: Visual Map </title>
      </Helmet>
      <Container maxWidth="l">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Visual Map
        </Typography>
        <MapContainer center={[50.8282, 12.9209]} zoom={4} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {productData?.map((product) => (
            <Marker position={[product?.latitude, product?.longitude]} key={product?.id} />
          ))}
        </MapContainer>
      </Container>
    </>
  );
};
//  <Marker position={[pos[0], pos[1]]} key={index} />;
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
});
L.Marker.prototype.options.icon = DefaultIcon;
export default VisualMap;
