// Allow us to handle multipart form data
export const config = {
    api: {
        bodyParser: false
    }
};

// Generate image variants from a webcam image
export default function handler(req, res) {
    const { Configuration, OpenAIApi } = require("openai");
    const formidable = require("formidable");
    const fs = require("fs");
    const path = require("path");

    require('dotenv').config();
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY2,
    });
    const openai = new OpenAIApi(configuration);

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing form data:", err);
            return res.status(400).json({ error: "Error parsing form data" });
        }

        try {
            const file = files.selfie;

            // Ensure the file is read as a buffer
            const buffer = fs.readFileSync(file.filepath);

            // Construct a File-like object
            const imageFile = {
                name: path.basename(file.filepath),
                type: "image/png", // Adjust type if needed
                data: buffer,
            };

            // OpenAI API call to create image variation
            const response = await openai.createImageVariation(
                imageFile, // Pass the image file
                3, // Number of variations
                "256x256" // Image size
            );

            const variants = response.data.data.map((data) => data.url);

            res.status(200).json({
                status: "Success",
                variants,
            });
        } catch (error) {
            console.error("Error creating image variation:", error.response?.data || error.message);
            res.status(500).json({ error: error.response?.data || error.message });
        }
    });
}
