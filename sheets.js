// Store perfume data from Google Sheets
let perfumeSheetData = {};
let perfumeData = []; // used by loadGoogleSheet/displayPerfumeList
let selectedPerfume = null;

let labelData = {
  perfumeName: 'SANTAL 33',
  labelled: '',
  on: '',
  for: ''
};

// save your sheet ID and name of the tab as variables for use
let sheetID = "17wU3rnvKlIrAW9_6gx3AxsPCvjwuFS5w_COqYG8bJ1g";
let tabName = 'Sheet1'

// format them into Ben's uri
let opensheet_uri = `https://opensheet.elk.sh/${sheetID}/${tabName}`

function loadSheetData() {
  fetch(opensheet_uri)
      .then(function (response) {
          return response.json();
      })
      .then(function (data) {
          console.log(data);
          // Store the data indexed by perfume name
          data.forEach(perfume => {
            const name = perfume[''];
            if (name) {
              // Normalize the name for lookup (lowercase, remove spaces and special chars)
              const normalizedName = name.toLowerCase()
                .replace(/\s+/g, '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); // Remove accents
              perfumeSheetData[normalizedName] = perfume;
            }
          });
          
          // Get the last row for label data
          if (data.length > 0) {
            const lastRow = data[data.length - 1];
            labelData.perfumeName = lastRow[''] || 'SANTAL 33';
            labelData.labelled = lastRow['Labelled'] || '';
            labelData.on = lastRow['On'] || '';
            labelData.for = lastRow['For'] || '';
            
            // Update the label display (guarded)
            const perfumeNameEl = document.getElementById('perfumeName');
            const displayNameEl = document.getElementById('displayName');
            const displayDateEl = document.getElementById('displayDate');
            const displayCityEl = document.getElementById('displayCity');
            if (perfumeNameEl) perfumeNameEl.textContent = labelData.perfumeName.toUpperCase();
            if (displayNameEl) displayNameEl.textContent = labelData.labelled;
            if (displayDateEl) displayDateEl.textContent = labelData.on;
            if (displayCityEl) displayCityEl.textContent = labelData.for;
            
            // Apply the perfume preset for the last row
            // lastRow is an object representing the sheet row
            applyPerfumePreset(lastRow);
          }
          
          console.log('Loaded perfume data:', perfumeSheetData);
          console.log('Label data:', labelData);
      })
      .catch(function (err) {
          console.log("Something went wrong!", err);
      });
}

// Load data initially
loadSheetData();

// Refresh data every 5 seconds
setInterval(loadSheetData, 5000);


   // Shader code
   const vertexShader = `
   varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }
 `;

 const fragmentShader = `
   uniform float uTime;
   uniform vec3 uColor1;
   uniform vec3 uColor2;
   uniform vec3 uColor3;
   uniform vec3 uColor4;
   uniform float uSpeed;
   uniform float uFrequency;
   uniform float uNoiseStrength;
   uniform float uGrainStrength;
   
   varying vec2 vUv;

   vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

   float snoise(vec2 v){
     const vec4 C = vec4(0.211324865405187, 0.366025403784439,
              -0.577350269189626, 0.024390243902439);
     vec2 i  = floor(v + dot(v, C.yy) );
     vec2 x0 = v -   i + dot(i, C.xx);
     vec2 i1;
     i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
     vec4 x12 = x0.xyxy + C.xxzz;
     x12.xy -= i1;
     i = mod(i, 289.0);
     vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
     + i.x + vec3(0.0, i1.x, 1.0 ));
     vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
     m = m*m ;
     m = m*m ;
     vec3 x = 2.0 * fract(p * C.www) - 1.0;
     vec3 h = abs(x) - 0.5;
     vec3 ox = floor(x + 0.5);
     vec3 a0 = x - ox;
     m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
     vec3 g;
     g.x  = a0.x  * x0.x  + h.x  * x0.y;
     g.yz = a0.yz * x12.xz + h.yz * x12.yw;
     return 130.0 * dot(m, g);
   }

   void main() {
     vec2 uv = vUv;
     float time = uTime * uSpeed;
     
     float n1 = snoise(uv * uFrequency + vec2(time * 0.15, time * 0.25));
     float n2 = snoise(uv * (uFrequency * 0.8) - vec2(time * 0.2, time * 0.12));
     float n3 = snoise(uv * (uFrequency * 1.8) + vec2(time * 0.35, -time * 0.18));
     float n4 = snoise(uv * (uFrequency * 0.5) + vec2(-time * 0.08, time * 0.22));
     
     vec2 warpedUv = uv + vec2(n1 * 0.3, n2 * 0.3) * uNoiseStrength;
     warpedUv += vec2(n3 * 0.15, n4 * 0.15) * uNoiseStrength;
     
     float flowNoise = snoise(warpedUv * 1.5 + time * 0.25);
     
     float mixVal1 = snoise(warpedUv * 1.8 + time * 0.18);
     float mixVal2 = snoise(warpedUv * 2.2 - time * 0.15);
     mixVal1 = mixVal1 * 0.5 + 0.5;
     mixVal2 = mixVal2 * 0.5 + 0.5;
     
     vec3 colorA = mix(uColor1, uColor2, smoothstep(0.0, 1.0, n1 * 0.5 + 0.5));
     vec3 colorB = mix(uColor3, uColor4, smoothstep(0.0, 1.0, n2 * 0.5 + 0.5));
     vec3 colorC = mix(uColor2, uColor3, smoothstep(0.0, 1.0, flowNoise * 0.5 + 0.5));
     
     vec3 blendAB = mix(colorA, colorB, mixVal1);
     vec3 finalColor = mix(blendAB, colorC, mixVal2 * 0.4);
     
     vec2 centered = uv - 0.5;
     float vignette = 1.0 - dot(centered, centered) * 0.8;
     finalColor *= vignette;
     
     // Animated grain using time
     float grain = fract(sin(dot(uv + uTime * 0.5, vec2(12.9898, 78.233))) * 43758.5453);
     finalColor += (grain - 0.5) * uGrainStrength;
     
     finalColor = pow(finalColor, vec3(0.95));

     gl_FragColor = vec4(finalColor, 1.0);
   }
 `;

 // Setup Three.js
 const canvas = document.getElementById('canvas');
 const scene = new THREE.Scene();
 const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
 const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
 
 // Size canvas to fit in its container
 function resizeCanvas() {
   const container = canvas.parentElement;
   const width = container.clientWidth;
   const height = container.clientHeight-125;
   renderer.setSize(width, height);
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 }
 
 resizeCanvas();

 // Color palettes based on perfume categories
 const palettes = {
   fresh: {
     name: 'Fresh',
     colors: ['#B0D8EE', '#7DB2FF', '#004FC4', '#000656']
   },
   amber: {
     name: 'Amber',
     colors: ['#6A3300', '#B76C00', '#FF9D00', '#FFCF71']
   },
   floral: {
     name: 'Floral',
     colors: ['#FFCBBD', '#FF93BA', '#FF3398', '#9C28DD']
   },
   woody: {
     name: 'Woody',
     colors: ['#405F00', '#A5CF00', '#E4EBA3', '#805300']
   },
 };

 // Create shader material
 const material = new THREE.ShaderMaterial({
   uniforms: {
     uTime: { value: 0 },
     uColor1: { value: new THREE.Color('#ff006e') },
     uColor2: { value: new THREE.Color('#8338ec') },
     uColor3: { value: new THREE.Color('#3a86ff') },
     uColor4: { value: new THREE.Color('#06ffa5') },
     uSpeed: { value: 0.3 },
     uFrequency: { value: 1.5 },
     uNoiseStrength: { value: 0.7 },
     uGrainStrength: { value: 0.08 }
   },
   vertexShader,
   fragmentShader
 });

 const geometry = new THREE.PlaneGeometry(2, 2);
 const mesh = new THREE.Mesh(geometry, material);
 scene.add(mesh);

 // Target values for smooth interpolation
 const targetValues = {
   color1: new THREE.Color('#ff006e'),
   color2: new THREE.Color('#8338ec'),
   color3: new THREE.Color('#3a86ff'),
   color4: new THREE.Color('#06ffa5'),
   speed: 0.3,
   frequency: 1.5,
   noiseStrength: 0.7,
   grainStrength: 0.08
 };

 // Current state for concentration and emotion
 let currentConcentration = 'loud'; // default to loud to match your sheet choices
 let currentEmotion = 'melancholy';

 // --- Robust SVG loader: replaces updateSVGOverlay ---
function updateSVGOverlay(concentration, emotion) {
  const overlay = document.getElementById('svgOverlay');
  const overlayImage = document.getElementById('overlayImage');
  if (!overlay || !overlayImage) {
    console.warn('SVG overlay elements not found (svgOverlay / overlayImage).');
    return;
  }

  // Normalize inputs
  const concLower = (concentration || '').toString().toLowerCase();
  const emotionLower = (emotion || '').toString().toLowerCase();

  // Map any possible incoming terms to the 3 allowed svg tokens
  const concentrationMap = {
    quiet: "quiet",
    medium: "medium",
    loud: "loud",
    strong: "loud",    // defensive
    intense: "loud"
  };

  const mappedConcentration = concentrationMap[concLower] || 'medium';
  const mappedEmotion = emotionLower || 'melancholy';

  // Candidate filename patterns and folders to try (ordered)
  const folders = ['', 'svgs/', 'images/']; // adjust/add more if your assets live elsewhere
  const patterns = [
    `${mappedEmotion}_${mappedConcentration}.svg`,
    `${mappedEmotion}-${mappedConcentration}.svg`,
    `${mappedEmotion}${mappedConcentration}.svg`, // no separator
    `${mappedEmotion}_${mappedConcentration}.SVG`, // uppercase ext (defensive)
    `${mappedEmotion}-${mappedConcentration}.SVG`
  ];

  // Show the overlay area while we try loading
  overlay.style.opacity = '0.6'; // semi-visible while loading
  overlayImage.src = ''; // clear current

  let tried = 0;
  const candidates = [];

  for (const folder of folders) {
    for (const pat of patterns) {
      candidates.push(folder + pat);
    }
  }

  // Try each candidate sequentially using an Image for reliable onload/onerror diagnosis
  function tryNext() {
    if (tried >= candidates.length) {
      console.error('updateSVGOverlay: no SVG found for', mappedEmotion, mappedConcentration, ' (tried):', candidates);
      overlay.style.opacity = '0'; // hide overlay on failure
      return;
    }

    const candidate = candidates[tried++];
    console.log('updateSVGOverlay: trying', candidate);

    const testImg = new Image();
    testImg.onload = function () {
      console.log('updateSVGOverlay: loaded', candidate);
      overlayImage.src = candidate;
      overlay.style.opacity = '1.0';
      // done
    };
    testImg.onerror = function () {
      console.warn('updateSVGOverlay: failed to load', candidate);
      // try next candidate
      tryNext();
    };

    // Kick off load
    // Use a cache-busting param during dev if you suspect caching, e.g. '?v=1'
    testImg.src = candidate;
  }

  tryNext();
}

 // Google Sheets integration
 function extractSheetId(url) {
   const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
   return match ? match[1] : null;
 }

 async function loadGoogleSheet(url) {
   const sheetId = extractSheetId(url);
   if (!sheetId) {
     alert('Invalid Google Sheets URL');
     return;
   }

   const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
   
   try {
     const response = await fetch(csvUrl);
     const text = await response.text();
     const rows = text.split('\n').map(row => row.split(','));
     
     const headers = rows[0];
     perfumeData = rows.slice(1).filter(row => row.length > 1).map(row => {
       const obj = {};
       headers.forEach((header, i) => {
         obj[header.trim()] = row[i] ? row[i].trim().replace(/^"|"$/g, '') : '';
       });
       return obj;
     });
     
     displayPerfumeList();
   } catch (error) {
     alert('Error loading sheet. Make sure it\'s publicly accessible!');
     console.error(error);
   }
 }

 function displayPerfumeList() {
   const listDiv = document.getElementById('perfumeList');
   if (!listDiv) return;
   listDiv.style.display = 'block';
   listDiv.innerHTML = '';
   
   perfumeData.forEach((perfume, index) => {
     const item = document.createElement('div');
     item.className = 'perfume-item';
     
     const name = perfume[''] || perfume['Perfume Name'] || 'Unnamed';
     const category = perfume['Scent Category (fresh, floral, amber, woody, gourmand)'] || 'Unknown';
     const intensity = perfume['Intensity'] || '-';
     
     item.innerHTML = `
       <div class="perfume-name">${name}</div>
       <div class="perfume-details">${category} • Intensity: ${intensity}</div>
     `;
     
     item.addEventListener('click', () => {
       document.querySelectorAll('.perfume-item').forEach(el => el.classList.remove('selected'));
       item.classList.add('selected');
       selectPerfume(perfume);
     });
     
     listDiv.appendChild(item);
   });
 }

 function selectPerfume(perfume) {
   selectedPerfume = perfume;
   
   // Update shader based on perfume properties
   const category = perfume['Scent Category (fresh, floral, amber, woody, gourmand)']?.toLowerCase() || 'fresh';
   const intensity = parseInt(perfume['Intensity']) || 2;
   const concentration = parseInt(perfume['Concentration?']?.match(/\d+/)?.[0]) || 2;
   
   // Apply palette based on category
   const palette = palettes[category] || palettes.fresh;
   applyPalette(palette, category);
   
   // Adjust parameters based on intensity and concentration
   targetValues.speed = 0.2 + (intensity / 5) * 0.4;
   targetValues.frequency = 1.0 + (concentration / 5) * 2.0;
   targetValues.noiseStrength = 0.5 + (intensity / 5) * 0.4;
   
   // Update UI controls (guarded)
   const freqValEl = document.getElementById('freqVal');
   if (freqValEl) freqValEl.textContent = targetValues.grainStrength.toFixed(2);
   
   // Update active weather button based on grain strength
   document.querySelectorAll('.weather-btn').forEach(btn => {
     const btnGrain = parseFloat(btn.dataset.grain);
     btn.classList.toggle('active', Math.abs(btnGrain - targetValues.grainStrength) < 0.02);
   });
   
   // Display perfume info
   const infoDiv = document.getElementById('currentInfo');
   if (infoDiv) {
     infoDiv.style.display = 'block';
     infoDiv.innerHTML = `
       <strong>${perfume[''] || 'Perfume'}</strong><br>
       Category: ${perfume['Scent Category (fresh, floral, amber, woody, gourmand)'] || '-'}<br>
       Season: ${perfume['season'] || '-'}<br>
       Intensity: ${perfume['Intensity'] || '-'}<br>
       Emotion: ${perfume['emotion'] || '-'}
     `;
   }
 }

 // Controls (guarded lookups)
 const color1Input = document.getElementById('color1');
 const color2Input = document.getElementById('color2');
 const color3Input = document.getElementById('color3');
 const color4Input = document.getElementById('color4');
 const userNameInput = document.getElementById('userName');
 const userCityInput = document.getElementById('userCity');

 if (color1Input) color1Input.addEventListener('input', (e) => {
   targetValues.color1.set(e.target.value);
 });
 if (color2Input) color2Input.addEventListener('input', (e) => {
   targetValues.color2.set(e.target.value);
 });
 if (color3Input) color3Input.addEventListener('input', (e) => {
   targetValues.color3.set(e.target.value);
 });
 if (color4Input) color4Input.addEventListener('input', (e) => {
   targetValues.color4.set(e.target.value);
 });
 
 // User name input handler
 if (userNameInput) userNameInput.addEventListener('input', (e) => {
   const displayNameEl = document.getElementById('displayName');
   if (displayNameEl) displayNameEl.textContent = e.target.value;
 });
 
 // User city input handler
 if (userCityInput) userCityInput.addEventListener('input', (e) => {
   const displayCityEl = document.getElementById('displayCity');
   if (displayCityEl) displayCityEl.textContent = e.target.value;
 });
 
 // Weather buttons for grain strength
 document.querySelectorAll('.weather-btn').forEach(btn => {
   btn.addEventListener('click', () => {
     const grainStrength = parseFloat(btn.dataset.grain);
     targetValues.grainStrength = grainStrength;
     const freqValEl = document.getElementById('freqVal');
     if (freqValEl) freqValEl.textContent = grainStrength.toFixed(2);
     
     // Update active state
     document.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
   });
 });

 // Concentration buttons
 document.querySelectorAll('.concentration-btn').forEach(btn => {
   btn.addEventListener('click', () => {
     // normalize dataset value: convert 'strong' to 'loud' if present in HTML (defensive)
     const raw = (btn.dataset.concentration || '').toString().toLowerCase();
     const normalized = (raw === 'strong') ? 'loud' : raw;
     currentConcentration = normalized;
     
     // Update active state
     document.querySelectorAll('.concentration-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     
     // Update SVG overlay
     updateSVGOverlay(currentConcentration, currentEmotion);
   });
 });

 // Emotion buttons
 document.querySelectorAll('.emotion-btn').forEach(btn => {
   btn.addEventListener('click', () => {
     currentEmotion = (btn.dataset.emotion || '').toString().toLowerCase() || 'melancholy';
     
     // Update active state
     document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     
     // Update SVG overlay
     updateSVGOverlay(currentConcentration, currentEmotion);
   });
 });

 // Perfume dropdown handler
 const perfumeSelect = document.getElementById('perfumeSelect');
 if (perfumeSelect) {
   perfumeSelect.addEventListener('change', (e) => {
     const perfumeKey = e.target.value;
     
     if (!perfumeKey) return;
     
     // Normalize the key to match stored data (remove accents)
     const normalizedKey = perfumeKey.toLowerCase()
       .replace(/\s+/g, '')
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '');
     
     const perfumeDataObj = perfumeSheetData[normalizedKey];
     
     if (perfumeDataObj) {
       applyPerfumePreset(perfumeDataObj);
       
       // Update h1 with perfume name
       const perfumeName = perfumeDataObj[''] || e.target.options[e.target.selectedIndex].text;
       const perfumeNameEl = document.getElementById('perfumeName');
       if (perfumeNameEl) perfumeNameEl.textContent = perfumeName.toUpperCase();
     } else {
       console.warn('No data found for perfume:', perfumeKey, 'normalized:', normalizedKey);
       console.log('Available keys:', Object.keys(perfumeSheetData));
     }
   });
 }

 function applyPerfumePreset(perfume) {
   if (!perfume || typeof perfume !== 'object') {
     console.warn('applyPerfumePreset called with invalid perfume:', perfume);
     return;
   }

   console.log('Applying perfume preset:', perfume);
   
   // Get category and apply color palette
   const category = perfume['Scent Category (fresh, floral, amber, woody, gourmand)']?.toLowerCase();
   if (category && palettes[category]) {
     applyPalette(palettes[category], category);
   }
   
   // Get weather and set grain strength
   const weather = (perfume['Weather'] || '').toLowerCase();
   let grainStrength = 0.08; // default to medium grain (cloudy)
   
   if (weather === 'clear' || weather === 'sunny') {
     grainStrength = 0.04; // less grain
   } else if (weather === 'cloudy') {
     grainStrength = 0.08; // medium grain
   } else if (weather === 'rainy' || weather === 'rain') {
     grainStrength = 0.15; // heavy grain
   }
   
   targetValues.grainStrength = grainStrength;
   const freqValEl = document.getElementById('freqVal');
   if (freqValEl) freqValEl.textContent = grainStrength.toFixed(2);
   
   // Update active weather button
   document.querySelectorAll('.weather-btn').forEach(btn => {
     const btnGrain = parseFloat(btn.dataset.grain);
     btn.classList.toggle('active', btnGrain === grainStrength);
   });
   
   // Apply concentration
   const concentrationRaw = (perfume['Concentration?'] || '').toString();
   let concentration = 'medium'; // default
   
   if (concentrationRaw) {
     const concLower = concentrationRaw.toLowerCase();

     if (concLower.includes('quiet')) {
       concentration = 'quiet';
     } else if (concLower.includes('medium')) {
       concentration = 'medium';
     } else if (concLower.includes('loud') || concLower.includes('strong') || concLower.includes('intense')) {
       // Accept 'loud' in sheet, but also defensively map 'strong' -> 'loud'
       concentration = 'loud';
     }
   }
   
   currentConcentration = concentration;
   
   // Update active concentration button
   document.querySelectorAll('.concentration-btn').forEach(btn => {
     // normalize btn dataset similarly for comparison
     const btnVal = (btn.dataset.concentration || '').toString().toLowerCase();
     const normalizedBtnVal = (btnVal === 'strong') ? 'loud' : btnVal;
     btn.classList.toggle('active', normalizedBtnVal === concentration);
   });
   
   // Apply emotion
   const emotionRaw = perfume['emotion'];
   let emotion = 'melancholy'; // default
   
   if (emotionRaw) {
     const emotionLower = emotionRaw.toLowerCase();
     if (emotionLower.includes('melancholy')) {
       emotion = 'melancholy';
     } else if (emotionLower.includes('bright')) {
       emotion = 'bright';
     } else if (emotionLower.includes('energetic')) {
       emotion = 'energetic';
     } else if (emotionLower.includes('calm')) {
       emotion = 'calm';
     }
   }
   
   currentEmotion = emotion;
   
   // Update active emotion button
   document.querySelectorAll('.emotion-btn').forEach(btn => {
     btn.classList.toggle('active', btn.dataset.emotion === emotion);
   });
   
   // Update SVG overlay
   updateSVGOverlay(currentConcentration, currentEmotion);
   
   // Display perfume info
   const infoDiv = document.getElementById('currentInfo');
   if (infoDiv) {
     infoDiv.style.display = 'block';
     infoDiv.innerHTML = `
       <strong>${perfume[''] || 'Perfume'}</strong><br>
       Category: ${perfume['Scent Category (fresh, floral, amber, woody, gourmand)'] || '-'}<br>
       Weather: ${perfume['Weather'] || '-'}<br>
       Concentration: ${perfume['Concentration?'] || '-'}<br>
       Emotion: ${perfume['emotion'] || '-'}
     `;
   }
 }

 // Start with everything black (guard inputs)
const black = '#000000';
if (color1Input) color1Input.value = black;
if (color2Input) color2Input.value = black;
if (color3Input) color3Input.value = black;
if (color4Input) color4Input.value = black;

targetValues.color1.set(black);
targetValues.color2.set(black);
targetValues.color3.set(black);
targetValues.color4.set(black);

// No palette buttons active at start
document.querySelectorAll('.palette-btn').forEach(btn => btn.classList.remove('active'));

 // Palette buttons
 const paletteButtons = document.querySelectorAll('.palette-btn');
 
 function applyPalette(palette, id) {
   const colors = palette.colors;
   
   if (color1Input) color1Input.value = colors[0];
   if (color2Input) color2Input.value = colors[1];
   if (color3Input) color3Input.value = colors[2];
   if (color4Input) color4Input.value = colors[3];
   
   targetValues.color1.set(colors[0]);
   targetValues.color2.set(colors[1]);
   targetValues.color3.set(colors[2]);
   targetValues.color4.set(colors[3]);
   
   paletteButtons.forEach(btn => {
     btn.classList.toggle('active', btn.dataset.palette === id);
   });
 }
 
 paletteButtons.forEach(btn => {
   btn.addEventListener('click', () => {
     const paletteId = btn.dataset.palette;
     const palette = palettes[paletteId];
     if (palette) {
       applyPalette(palette, paletteId);
     }
   });
 });

 // Animation loop
 const clock = new THREE.Clock();
 
 function animate() {
   requestAnimationFrame(animate);
   
   const delta = clock.getDelta();
   material.uniforms.uTime.value += delta;
   
   const lerpFactor = 2.0 * delta;
   const colorLerp = 2.5 * delta;
   
   material.uniforms.uSpeed.value = THREE.MathUtils.lerp(
     material.uniforms.uSpeed.value,
     targetValues.speed,
     lerpFactor
   );
   
   material.uniforms.uFrequency.value = THREE.MathUtils.lerp(
     material.uniforms.uFrequency.value,
     targetValues.frequency,
     lerpFactor
   );
   
   material.uniforms.uNoiseStrength.value = THREE.MathUtils.lerp(
     material.uniforms.uNoiseStrength.value,
     targetValues.noiseStrength,
     lerpFactor
   );
   
   material.uniforms.uGrainStrength.value = THREE.MathUtils.lerp(
     material.uniforms.uGrainStrength.value,
     targetValues.grainStrength,
     lerpFactor
   );
   
   material.uniforms.uColor1.value.lerp(targetValues.color1, colorLerp);
   material.uniforms.uColor2.value.lerp(targetValues.color2, colorLerp);
   material.uniforms.uColor3.value.lerp(targetValues.color3, colorLerp);
   material.uniforms.uColor4.value.lerp(targetValues.color4, colorLerp);
   
   renderer.render(scene, camera);
 }

 animate();

 // Handle resize
 window.addEventListener('resize', () => {
   resizeCanvas();
 });
