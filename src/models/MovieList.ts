import mongoose, { Schema, Document } from "mongoose";

export interface IMovieList extends Document {
    user: mongoose.Schema.Types.ObjectId;
    imdbID: string;
    title: string;
    year?: string;
    endYear?: string;
    category: string;
    genre?: string[];
    rating?: number;
    voteCount?: number;
    actors?: string[];
    director?: string[];
    certificate?: string;
    poster?: string;
    plot?: string;
    watched?: boolean;
    favorite?: boolean;
}

const MovieListSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    imdbID: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    year: {
        type: String,
    },
    endYear: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    genre: {
        type: [String],
    },
    rating: {
        type: Number,
    },
    voteCount: {
        type: Number,
    },
    actors: {
        type: [String],
    },
    director: {
        type: [String],
    },
    certificate: {
        type: String,
    },
    poster: {
        type: String,
    },
    plot: {
        type: String,
    },
    watched: {
        type: Boolean,
        default: false,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
});

export default mongoose.model<IMovieList>("MovieList", MovieListSchema); 