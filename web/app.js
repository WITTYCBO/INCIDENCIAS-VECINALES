const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/REEMPLAZA_CON_TU_URL/exec';

const form = document.getElementById('incident-form');
const messageEl = document.getElementById('message');
const locateBtn = document.getElementById('locate-btn');
const coordsDisplay = document.getElementById('coords-display');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');

function showMessage(text, type = 'info') {
  messageEl.textContent = text;
  messageEl.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    messageEl.classList.add('is-error');
  } else if (type === 'success') {
    messageEl.classList.add('is-success');
  }
  messageEl.style.display = 'block';
}

function hideMessage() {
  messageEl.style.display = 'none';
  messageEl.textContent = '';
  messageEl.classList.remove('is-error', 'is-success');
}

function formatCoordinates(lat, lng) {
  return `Lat: ${Number(lat).toFixed(6)} | Lng: ${Number(lng).toFixed(6)}`;
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        name: file.name,
        type: file.type,
        data: base64String,
      });
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showMessage('La geolocalización no es compatible con tu dispositivo.', 'error');
    return;
  }

  locateBtn.disabled = true;
  locateBtn.textContent = 'Obteniendo ubicación…';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      latitudeInput.value = latitude;
      longitudeInput.value = longitude;
      coordsDisplay.textContent = formatCoordinates(latitude, longitude);
      hideMessage();
      locateBtn.disabled = false;
      locateBtn.textContent = 'Obtener ubicación actual';
    },
    (error) => {
      console.error(error);
      showMessage('No se pudo obtener la ubicación. Comprueba los permisos del navegador.', 'error');
      locateBtn.disabled = false;
      locateBtn.textContent = 'Obtener ubicación actual';
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();

  if (!form.reportValidity()) {
    showMessage('Por favor, completa los campos obligatorios.', 'error');
    return;
  }

  const photoFile = form.photo.files[0];
  if (!photoFile) {
    showMessage('Debes adjuntar una fotografía de la incidencia.', 'error');
    return;
  }

  const incident = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    incidentType: form.incidentType.value,
    description: form.description.value.trim(),
    latitude: latitudeInput.value,
    longitude: longitudeInput.value,
    timestamp: new Date().toISOString(),
  };

  try {
    const photo = await fileToBase64(photoFile);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident, photo }),
    });

    if (!response.ok) {
      throw new Error(`Error al guardar la incidencia (${response.status}).`);
    }

    const result = await response.json();
    if (result?.status !== 'success') {
      throw new Error(result?.message || 'No se pudo registrar la incidencia.');
    }

    form.reset();
    coordsDisplay.textContent = 'Sin datos de ubicación.';
    latitudeInput.value = '';
    longitudeInput.value = '';
    showMessage('¡Incidencia registrada correctamente!', 'success');
  } catch (error) {
    console.error(error);
    showMessage(error.message || 'Se produjo un error al enviar la incidencia.', 'error');
  }
});
