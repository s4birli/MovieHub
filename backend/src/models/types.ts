import { Request, Response, NextFunction } from 'express';

export interface MovieListQuery {
    page?: number;
    limit?: number;
    genres?: string | string[];
    mediaType?: 'movie' | 'tv';
    status?: 'watched' | 'unwatched';
    sortBy?: 'title' | 'rating' | 'year';
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface AuthRequest extends Request {
    user?: { id: string };
}

export type CustomRequestHandler<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = MovieListQuery
> = (
    req: AuthRequest,
    res: Response<ResBody>,
    next: NextFunction
) => Promise<any>; 