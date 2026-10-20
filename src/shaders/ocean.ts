export const oceanVert = /* glsl */ `
uniform float uTime; uniform float uAmp; varying vec3 vWorld; varying float vH;
void main(){
  vec3 p = position;
  float h = (sin(p.x*.25+uTime*1.1)*.9 + sin(p.y*.18-uTime*.8)*.7 + sin((p.x+p.y)*.5+uTime*1.9)*.25) * uAmp;
  p.z += h; vH = h / max(uAmp, .001);
  vec4 w = modelMatrix*vec4(p,1.); vWorld = w.xyz;
  gl_Position = projectionMatrix*viewMatrix*w;
}`;
export const oceanFrag = /* glsl */ `
uniform float uFlash; uniform vec3 uFogColor; uniform float uFogDensity; uniform vec3 uDeep; uniform vec3 uFoam;
varying vec3 vWorld; varying float vH;
void main(){
  float crest = smoothstep(.9,1.7,vH);
  vec3 col = mix(uDeep, uFoam, crest*.8) + vec3(.55,.6,.8)*uFlash*(.3+crest);
  float d = length(vWorld - cameraPosition);
  float fog = 1. - exp(-uFogDensity*uFogDensity*d*d*exp(-max(vWorld.y,0.)*.05));
  gl_FragColor = vec4(mix(col, uFogColor + uFlash*.3, clamp(fog,0.,1.)), 1.);
}`;
