import express, { Request, Response, Express } from 'express';
import transactionRoutes from './routes/transactionRoutes';

const app: Express = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', transactionRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});