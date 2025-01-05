async function takeSelfieAndSendToAPI() {
    // Ask for the front-facing camera
    var facingMode = "user";
    var constraints = {
        audio: false,
        video: {
         facingMode: facingMode
        }
      }

    // Get access to the user's webcam
    //const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Create a new video element to display the webcam stream
    const video = document.createElement("video");
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    
    video.classList.add("rainbow");
    
    video.srcObject = stream;
    video.autoplay = true;

    document.getElementById("grid").replaceChildren();
    document.getElementById("grid").appendChild(video);

    // Add some copy
    var span = document.createElement('span');
    span.classList.add("cameraswitcher");
    span.innerHTML = "* tap the video to switch cameras";
    document.getElementById("grid").appendChild(span);

    //const element = document.getElementById('grid');
    //element.scrollIntoView();

    const startButton = document.getElementById('mirror-starter');
    startButton.classList.add("deactivated");
    //startButton.classList.add("inactive");

    // Allow user to switch between camera views
    // From https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295
    video.addEventListener('click', function() {
        if (facingMode == "user") {
            facingMode = "environment";
        } else {
            facingMode = "user";
        }
        
        constraints = {
            audio: false,
            video: {
            facingMode: facingMode
            }
        } 
        
        navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
            video.srcObject = stream; 
        });
    });
    
    // Wait for the user to click a button to take the photo
    await new Promise(resolve => {
            const button = document.createElement("button");
            button.classList.add("vibe");
            button.textContent = "Check your vibe in the multiverse 🌈";
            button.onclick = resolve;
            document.getElementById("grid").append(button);
    });
    document.getElementById("grid").replaceChildren();

    // Create a square canvas element to capture the photo
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(video.videoWidth, video.videoHeight);
    canvas.height = canvas.width;
    const x = (video.videoWidth - canvas.width) / 2;
    const y = (video.videoHeight - canvas.height) / 2;
    canvas.getContext("2d").drawImage(video, x, y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    // Convert the photo to a Blob object
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();

    // Send the photo to the API endpoint via a POST request
    const formData = new FormData();
    formData.append("selfie", blob);

    // Display a loading icon and make the API call
    const loader = document.querySelector('#loader img')
    loader.style.display = 'inline';

    try
    {
        const response = await fetch("/api/mirror", { method: "POST", body: formData });
        loader.style.display = 'none';

        const imagesContainerCopy = document.getElementById("grid");
        const copyList = [
                "Claim your authentic true being ❤️",
                "You contain multitudes 🌻",
                "You make this universe special 🦩",  
        ]
        imagesContainerCopy.innerHTML = "<p id='bio'><span class='hi-lite-alt'>" + copyList[Math.floor( (Math.random() * copyList.length ))] + "</span></p>";

        // Parse the response and render the image URLs
        const data = await response.json();
        console.log(data);
        const imagesContainer = document.getElementById("grid");
        for (const imageUrl of data.variants) {
                const img = document.createElement("img");
                img.src = imageUrl;
                imagesContainer.appendChild(img);
        }

        // Swap over the buttons
        const startButton = document.getElementById('mirror-starter');
        const photoList = document.getElementById('grid').appendChild(startButton);
        startButton.innerHTML = "Peer again into the Mirror of Multitudes🪞"
        startButton.classList.remove("deactivated");
    }
    finally
    {
        console.log("Error calling API");
        loader.style.display = 'none';
    }

    // Stop the webcam stream and remove the video element from the DOM
    try
    {
        stream.getTracks().forEach(track => track.stop());
        document.getElementById("grid").removeChild(video);
    }
    catch 
    {
        console.log('Error removing video');
    }
}