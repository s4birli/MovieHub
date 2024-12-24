import express, { Request, Response } from "express";
import axios from "axios";
import MovieList from "../models/MovieList";

interface AuthRequest extends Request {
    user?: { id: string };
}

const router = express.Router();

// Film arama endpoint'i
router.get("/search", async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query) {
            res.status(400).json({ message: "Arama sorgusu gerekli" });
        }

        const options = {
            method: "GET",
            url: "https://imdb8.p.rapidapi.com/title/find",
            params: {
                q: query,
            },
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
                "x-rapidapi-host": "imdb8.p.rapidapi.com",
            },
        };
        const response = await axios.request<{ results: any[] }>(options);
        const results = response.data.results || [];

        const processedResults = results
            .filter((item: any) => item.titleType === "movie" || item.titleType === "tvSeries")
            .map((item: any) => ({
                imdbID: item.id.split("/")[2],
                title: item.title,
                year: item.year?.toString(),
                endYear: item.endYear?.toString(),
                category: item.titleType,
                poster: item.image?.url || null,
            }));

        res.json(processedResults);
    } catch (error) {
        console.error("Film arama hatası:", error);
        res.status(500).json({ message: "Film arama sırasında bir hata oluştu" });
    }
});

// Kullanıcının film listesini getir
router.get("/list", async (req: AuthRequest, res: Response) => {
    try {
        const movies = await MovieList.find({ user: req.user?.id });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: "Film listesi getirilirken hata oluştu" });
    }
});

// Filme listesine film ekle
router.post("/list", async (req: AuthRequest, res: Response) => {
    try {
        const movieData = {
            ...req.body,
            user: req.user?.id
        };

        const existingMovie = await MovieList.findOne({
            user: req.user?.id,
            imdbID: movieData.imdbID
        });

        if (existingMovie) {
            res.status(400).json({ message: "Bu film zaten listenizde mevcut" });
        }

        const movie = new MovieList(movieData);
        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ message: "Film eklenirken hata oluştu" });
    }
});

// Film güncelle (izlendi/favori durumu vb.)
router.put("/list/:id", async (req: AuthRequest, res: Response) => {
    try {
        const movie = await MovieList.findOneAndUpdate(
            { _id: req.params.id, user: req.user?.id },
            { $set: req.body },
            { new: true }
        );

        if (!movie) {
            res.status(404).json({ message: "Film bulunamadı" });
        }

        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: "Film güncellenirken hata oluştu" });
    }
});

// Filmi listeden kaldır
router.delete("/list/:id", async (req: AuthRequest, res: Response) => {
    try {
        const movie = await MovieList.findOneAndDelete({
            _id: req.params.id,
            user: req.user?.id
        });

        if (!movie) {
            res.status(404).json({ message: "Film bulunamadı" });
        }

        res.json({ message: "Film başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ message: "Film silinirken hata oluştu" });
    }
});

export default router; 