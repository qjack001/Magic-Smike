
<h6 align="center">
  <br>
  <a href="https://qjack001.github.io/Magic-Smike/"><img src="https://qjack001.github.io/Magic-Smike/logo.png" alt="Magic Smike" width="200"></a>
  <br>
</h6>

<h4 align="center"><a href="https://qjack001.github.io/Magic-Smike/">Magic Smike</a> is a smart bike, built as the cumulative Internet-of-Things project for CISC-340.</h4>

<p align="center">
  <a href="#description">Description</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#credits">Credits</a> •
  <a href="#authors">Authors</a>
</p>

![webpage screenshot](https://qjack001.github.io/Magic-Smike/screenshot.png)

## Description

Magic Smike (a portmanteau of "magic smart bike") is an Internet-connected smart bike that records the rider's journey. It was built using a Flora V3, Flora GPS, magnetic wheel-encoder, and Micro SD card reader. The rider's location and speed are tracked and then uploaded to a Google cloud server. The data is stored in a JSON tree, and accessed through HTTPS requests. The website then parsed the JSON tree and renders the trip's data. This repository features the front-end asspect of this project, as well as a recreation of the server data (since it is no-longer in operation). A poster with information on the hardware aspects of the project can be downloaded [here](https://github.com/qjack001/Magic-Smike/blob/master/poster.pdf).

## Key Features

- Map with route travelled
- Graph of bike's speed over time
- Server communication over HTTPS requests
- Total distance travelled, top speed, and average speed
- Simple navigation through past bike trips
- Responive web design

## Credits

- [Chart.js](https://www.chartjs.org/) - Used to display graph of speed.
- [Here Maps](https://www.here.com/) - Used to render the map with route travelled.

## Authors

[**Jack Guinane**](https://github.com/qjack001) - Website design and development, server-website communication.

[**Kyusung Shim**](https://github.com/shimks) - Server-side programming (code can be found [here](https://github.com/shimks/smike)).

**Renée Rosario** - Team manager.

**David Ariel Delcourt** - Flora V3, Flora GPS, SD-server communication, general hardware.

**John David Anthony** - Wheel encoder, SD card reader, general hardware, video production.

**John Lee** - Flora V3, general hardware.

**Liam Walsh** - Wheel encoder, general hardware.

**Su Bayek Lixian** - Poster design, general hardware.
