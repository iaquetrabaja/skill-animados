import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Pelicula} from './motor/Pelicula';
import * as demo from './demo/cielo';
import * as video from './video/planos';
import {MUESTRARIO} from './muestrario';
import {crearVoz} from './motor/voz';

const FPS = 30;
const DemoCielo: React.FC = () => <Pelicula planos={demo.PLANOS} voz={demo.voz} audio={staticFile('cielo/voz.wav')} claves={demo.CLAVES} duracion={demo.DURACION} />;
const Video: React.FC = () => <Pelicula planos={video.PLANOS} voz={video.voz} audio={staticFile('voz.wav')} claves={video.CLAVES} duracion={video.DURACION} />;

// La lámina del kit no tiene voz: unos segundos mudos para verla moverse.
const vozMuda = crearVoz({palabras: [{w: 'kit', texto: 'kit', t: 0, f: 0.1}], duracion: 4});
const Muestrario: React.FC = () => <Pelicula planos={[MUESTRARIO]} voz={vozMuda} audio={staticFile('voz.wav')} subtitulos="ninguno" duracion={4} acabado={{grano: 0, vineta: 0}} />;

export const Raiz: React.FC = () => (
  <>
    <Composition id="Demo" component={DemoCielo} durationInFrames={Math.ceil(demo.DURACION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Video" component={Video} durationInFrames={Math.ceil(video.DURACION * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="Muestrario" component={Muestrario} durationInFrames={120} fps={FPS} width={1080} height={1920} />
  </>
);
