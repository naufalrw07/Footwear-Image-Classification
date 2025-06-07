let model;
const labels = ['Boot', 'Sandal', 'Shoe'];

async function loadModel() {
  try {
    model = await tf.loadGraphModel('tfjs_model/model.json');
    document.getElementById('result').innerText = '✅ Model loaded. Please upload an image!';
  } catch (error) {
    console.error('Error loading model:', error);
    document.getElementById('result').innerText = `❌ Failed to load model: ${error.message}`;
  }
}

function preprocessImage(imageElement) {
  return tf.browser.fromPixels(imageElement)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();
}

function simulateLoadingProgress() {
  return new Promise(resolve => {
    const bar = document.getElementById('progress-bar');
    const container = document.getElementById('progress-container');
    container.style.display = 'block';
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
        resolve();
      } else {
        width += Math.random() * 10;
        if (width > 100) width = 100;
        bar.style.width = `${width}%`;
      }
    }, 150);
  });
}

async function predictImage(file) {
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('image-preview').appendChild(img);

    document.getElementById('result').innerText = '⏳ Classifying...';
    document.getElementById('details').innerHTML = '';

    await simulateLoadingProgress();

    const tensor = preprocessImage(img);
    const prediction = await model.predict(tensor).data();

    const maxIndex = prediction.indexOf(Math.max(...prediction));
    const predictedLabel = labels[maxIndex] || `Class ${maxIndex}`;
    const confidence = (prediction[maxIndex] * 100).toFixed(2);

    document.getElementById('result').innerText = `Prediction: ${predictedLabel} (${confidence}%)`;

    let detailsHtml = '<strong>All Predictions:</strong><br>';
    prediction.forEach((p, idx) => {
      detailsHtml += `${labels[idx] || 'Class ' + idx}: ${(p * 100).toFixed(2)}%<br>`;
    });
    document.getElementById('details').innerHTML = detailsHtml;

    document.getElementById('reupload-btn').classList.remove('hidden');
    document.getElementById('reset-btn').classList.remove('hidden');

    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('progress-bar').style.width = '0%';
  };
}

document.getElementById('file-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && model) {
    predictImage(file);
  }
});

document.getElementById('reupload-btn').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('image-preview').innerHTML = '';
  document.getElementById('result').innerText = '✅ Model loaded. Please upload an image!';
  document.getElementById('details').innerHTML = '';
  document.getElementById('reupload-btn').classList.add('hidden');
  document.getElementById('reset-btn').classList.add('hidden');
});

loadModel();
