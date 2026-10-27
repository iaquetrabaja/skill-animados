import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Video} from './Video';
import cues from '../public/cues.json';
import {Demo} from './Demo';
import historia from '../public/demo/frases.json';

export const FPS = 30;

export const Raiz: React.FC = () => (
  <><Composition id="Demo" component={Demo} durationInFrames={Math.ceil((historia.at(-1)!.fin+.5)*30)} fps={30} width={1080} height={1920}/><Composition
    id="Video"
    component={Video}
    durationInFrames={Math.ceil(((cues as {duracion: number}).duracion + 0.8) * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{voz: staticFile('voz.wav')}}
  /></>
);
