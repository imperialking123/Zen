import axios from "axios";
import { Router } from "express";

const GifRoute = Router();

GifRoute.get("/search/:query/:lang", async (req, res) => {
  try {
    const { query, lang = "en" } = req.params || {};

    const PREFERED_GIF_HANDLER = process.env.PREFERED_GIF_HANDLER || 'giphy'
    const VALID_GIF_HANDLERS = ["giphy", "tenor"];

    if (!VALID_GIF_HANDLERS.includes(PREFERED_GIF_HANDLER)) {
      console.error(
        "Invalid PREFERED_GIF_HANDLER. Expected 'giphy' or 'tenor'."
      );

      return res.status(500).json({ message: "SERVER_ERROR" });

    }

    if (PREFERED_GIF_HANDLER === "giphy") {


      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "INVALID_QUERY" });
      }

      const searchRes = await axios.get(process.env.GIPHY_SEARCH_ENDPOINT, {
        params: {
          api_key: process.env.GIPHY_API_KEY,
          q: query,
          limit: 50,
          bundle: "messaging_non_clips",
          lang,
          fields: "id,images",
        },
      });

      const gifData = searchRes.data.data || [];

      const filtered = gifData.map((gif) => ({
        id: gif.id,
        preview: gif.images.fixed_width.mp4,
        full: gif.images.downsized_medium?.url || gif.images.original.mp4,
        width: parseInt(gif.images.fixed_width.width),
        height: parseInt(gif.images.fixed_width.height),
      }));

      return res.status(200).json({
        message: filtered.length > 0 ? "SUCCESS" : "NO_RESULTS",
        data: filtered, // Empty array if no results
      });
    }

    if (PREFERED_GIF_HANDLER === "tenor") {
      const TENOR_API_KEY = process.env.TENOR_API_KEY;
      const TENOR_BASE_URL = process.env.TENOR_BASE_URL;

      if (!TENOR_API_KEY) {
        console.log("Error on GifRoute #gifRoute.js error ->",
          "Prefered Gif Provider is tenor and no tenor api key")
        return res.status(400).json({ message: "SOMETHING_WENT_WRONG" })
      }

      if (!TENOR_BASE_URL) {
        console.log("Error on GifRoute #gifRoute.js error ->",
          "No TENOR_BASE_URL Provided")
        return res.status(400).json({ message: "SOMETHING_WENT_WRONG" })
      }

      const searchUrl = `${TENOR_BASE_URL}/search`
      const response = await axios.get(searchUrl, {
        params: {
          q: query,
          key: TENOR_API_KEY,
          limit: 50
        }
      })

      const results = response.data.results

      const formatedResults = Array.isArray(results) ? results.map((gif) => {
        const media_formats = gif.media_formats
        return {
          id: gif.id,
          full: media_formats.mp4.url,
          preview: media_formats.tinymp4.url,
          width: media_formats.tinymp4.dims[0],
          height: media_formats.tinymp4.dims[1],
        }
      }) : []




      return res.status(200).json({
        message: formatedResults.length > 0 ? "SUCCESS" : "NO_RESULTS",
        data: formatedResults, // Empty array if no results
      });
    }

  } catch (error) {
    console.error("GIF search error:", error?.message || error);
    return res.status(500).json({ message: "SERVER_ERROR" });
  }
});

GifRoute.get("/categories/:lang", async (req, res) => {
  try {
    const { lang } = req.query


    const PREFERED_GIF_HANDLER = process.env.PREFERED_GIF_HANDLER || 'giphy'

    const VALID_GIF_HANDLERS = ["giphy", "tenor"];

    if (!VALID_GIF_HANDLERS.includes(PREFERED_GIF_HANDLER)) {
      console.error(
        "Invalid PREFERED_GIF_HANDLER. Expected 'giphy' or 'tenor'."
      );

      return res.status(500).json({ message: "SERVER_ERROR" });

    }

    if (PREFERED_GIF_HANDLER === "giphy") {


      const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
      const GIPHY_CATEGORY_ENDPOINT = process.env.GIPHY_CATEGORY_ENDPOINT;

      if (!GIPHY_API_KEY) {
        console.log("Error on GifRoute #gifRoute.js error ->",
          "Prefered Gif Provider is giphy and no giphy api key")
        return res.status(400).json({ message: "SOMETHING_WENT_WRONG" })
      }

      if (!GIPHY_CATEGORY_ENDPOINT) {
        console.log("Error on GifRoute #gifRoute.js error ->",
          "No GIPHY_CATEGORY_ENDPOINT  Provided")
        return res.status(400).json({ message: "SOMETHING_WENT_WRONG" })
      }


      const response = await axios.get(GIPHY_CATEGORY_ENDPOINT, {
        params: {
          api_key: GIPHY_API_KEY,
          fields: " gif,gif.url",
          lang: lang
        }
      })

      const results = response.data.data

      const formatedResults = Array.isArray(results) ? results.map((d) => {

        return {
          searchterm: d.name_encoded,
          path: d.gif.slug,
          image: d.gif.images.preview_gif.url,
          name: d.name
        }
      }) : []

      console.log(formatedResults)

      return res.status(200).json({ tags: formatedResults })



    }

    if (PREFERED_GIF_HANDLER === "tenor") {
      const TENOR_API_KEY = process.env.TENOR_API_KEY;
      const TENOR_BASE_URL = process.env.TENOR_BASE_URL;


      if (!TENOR_API_KEY) {
        console.log("Error on GifRoute #gifRoute.js error ->",
          "Prefered Gif Provider is tenor and no tenor api key")
        return res.status(400).json({ message: "SOMETHING_WENT_WRONG" })
      }

      if (!TENOR_BASE_URL) {
        console.log("Error on GifRoute #gifRoute.js error ->",
          "No TENOR_BASE_URL Provided")
        return res.status(400).json({ message: "SOMETHING_WENT_WRONG" })
      }

      const url = `${TENOR_BASE_URL}/categories`


      const response = await axios.get(url, {
        params: {
          locale: lang,
          key: TENOR_API_KEY,
        }
      })

      return res.status(200).json(response.data)

    }



  } catch (error) {
    console.log("Error on gifRoute #gifRoute.js  @/categories Endpoint Error --> ", error.message || error)
    return res.status(500).json({ message: "SERVER_ERROR" })
  }
})

export default GifRoute;
