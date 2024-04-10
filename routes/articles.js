const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const axios = require('axios');
const cheerio = require('cheerio');
const multer = require('multer');

const host = "https://tengri-news-server-fb457f2a9e75.herokuapp.com/";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});


router.get('/', async (req, res) => {
    console.log("запрос");
    const {page = 1, limit = 10} = req.query;
    try {
        const articles = await Article.find()
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        const count = await Article.countDocuments();
        res.json({
            articles,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

router.get('/with-params', async (req, res) => {
    const {search, category} = req.query;
    let query = {};

    if (search) {
        query.$text = {$search: search};
    }
    if (category) {
        query.category = category;
    }

    try {
        const articles = await Article.find(query);
        res.json(articles);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


router.get('/:id', getArticle, (req, res) => {
    res.json(res.article);
});

async function getArticle(req, res, next) {
    let article;
    try {
        article = await Article.findById(req.params.id);
        if (article == null) {
            return res.status(404).json({message: 'Cannot find article'});
        }
    } catch (err) {
        return res.status(500).json({message: err.message});
    }

    res.article = article;
    next();
}


const fetchNewsWithPagination = async (page) => {
    try {
        const baseUrl = 'https://tengrinews.kz/news';
        const pageUrl = page === 1 ? baseUrl : `${baseUrl}/page/${page}/`;
        try {
            const {data} = await axios.get(pageUrl);
            const $ = cheerio.load(data);
            const articles = [];

            $('.content_main .content_main_item').each((i, elem) => {
                const article = {
                    title: $(elem).find('.content_main_item_title a').text().trim(),
                    link: `${$(elem).find('.content_main_item_title a').attr('href').trim()}`,
                    summary: $(elem).find('.content_main_item_announce').text().trim(),
                    imageUrl: "https://tengrinews.kz" + $(elem).find('.content_main_item_img').attr('src'),
                    date: $(elem).find('.content_main_item_meta span').first().text().trim(),
                };
                articles.push(article);
            });
            let totalPages = 1;
            $('.pagination .page-item a').each((i, elem) => {
                const pageText = $(elem).text().trim();
                const pageNumber = parseInt(pageText);
                if (!isNaN(pageNumber)) {
                    totalPages = Math.max(totalPages, pageNumber);
                }
            });

            return {articles, totalPages};
        } catch (error) {
            console.error('Ошибка при парсинге новостей с пагинацией:', error);
            return {articles: [], totalPages: 0};
        }
    } catch (error) {
        console.error('Ошибка при парсинге новостей:', error);
        return [];
    }
};

router.get('/tengri/get-actual', async (req, res) => {
    const {page = 1} = req.query;
    const {articles, totalPages} = await fetchNewsWithPagination(page);
    res.json({articles, totalPages});
});
const fetchArticleDetail = async (articlePath) => {
    try {
        const fullUrl = `https://tengrinews.kz${articlePath}`;
        const {data} = await axios.get(fullUrl);
        const $ = cheerio.load(data);
        let content = '';
        let title = "";
        let mediaUrl = ""; // Переменная для хранения URL изображения или видео

        $('.content_main_text p').each((i, elem) => {
            content += $(elem).text() + '\n\n';
        });

        $('.head-single').each((i, elem) => {
            title += $(elem).text();
        });

        // Проверяем наличие изображения
        const img = $('.content_main_thumb_img img').attr("src");
        if (img) {
            mediaUrl = "https://tengrinews.kz" + img;
        }

        // Проверяем наличие видео, если изображение отсутствует
        if (!mediaUrl) {
            const videoSource = $('.content_main_thumb video source').attr("src");
            if (videoSource) {
                mediaUrl = "https://tengrinews.kz" + videoSource;
            }
        }

        console.log(fullUrl);
        console.log(mediaUrl);

        return {
            title,
            content,
            mediaUrl, // Возвращаем URL медиа (изображение или видео)
        };
    } catch (error) {
        console.error('Ошибка при парсинге детальной страницы статьи:', error);
        return '';
    }
};

router.get('/tengri/get-actual-detail', async (req, res) => {
    const articlePath = req.query.path;
    if (!articlePath) {
        return res.status(400).send('Path parameter is required');
    }

    const articleDetail = await fetchArticleDetail(articlePath);
    if (articleDetail) {
        res.json({content: articleDetail});
    } else {
        res.status(404).send('Article not found');
    }
});
router.post('/', upload.single('image'), async (req, res) => {
    const {title, content, summary, category} = req.body;
    const imageUrl = host + (req.file ? req.file.path : '');

    try {
        const newArticle = new Article({title, content, summary, category, mediaUri: imageUrl});
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const resD = await Article.deleteOne({_id: req.params.id});

        if (!resD.deletedCount) {
            return res.status(404).json({message: "Article not found"});
        }
        res.json({message: "Article deleted"});
    } catch (err) {
        next(err);
    }
});

router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({message: "Article not found"});
        }

        article.title = req.body.title || article.title;
        article.content = req.body.content || article.content;
        article.summary = req.body.summary || article.summary;
        article.category = req.body.category || article.category;

        if (req.file) {
            article.image_url = req.file.path;
        }

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});


module.exports = router;
