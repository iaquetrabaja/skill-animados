import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Video} from './Video';
import cues from '../public/cues.json';
import {Demo} from './Demo';

export const FPS = 30;

export const Raiz: React.FC = () => (
  <><Composition id="Demo" component={Demo} durationInFrames={360} fps={30} width={1080} height={1920}/><Composition
    id="Video"
    component={Video}
    durationInFrames={Math.ceil(((cues as {duracion: number}).duracion + 0.8) * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{voz: staticFile('voz.wav')}}
  /></>
);
