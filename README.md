# Tengri News Clone Backend

## Описание проекта

Это backend часть клонированного приложения Tengri News, разработанного для обучающих целей. Он предназначен для сбора, хранения и обработки новостей, связанных с Казахстаном.

## Технологический стек

- Node.js
- Express.js
- MongoDB с Mongoose
- Cheerio для веб-скрапинга
- Axios для HTTP-запросов

## Разработка

Процесс разработки включал планирование архитектуры API, создание моделей данных и интеграцию веб-скрапинга для динамического получения содержимого с сайта Tengri News. Был использован подход REST для обеспечения четкого и последовательного взаимодействия с фронтендом.

## Особенности

- Веб-скрапинг новостей с Tengri News для актуального содержимого.
- CRUD операции для управления новостными статьями.
- Пагинация, поиск и фильтрация статей на стороне сервера.
- Обработка и хранение медиафайлов.

## Проблемы и решения

В ходе разработки я столкнулся с необходимостью поддержки видео контента в дополнение к изображениям. Для решения этой задачи была добавлена логика, определяющая тип медиа-содержимого и соответствующим образом формирующая ответ API.

## Известные проблемы

Некоторые функции пагинации были сложны в реализации из-за динамической природы веб-скрапинга и требовали дополнительной настройки для согласования с клиентской логикой.

## Инструкции по настройке

1. Клонируйте репозиторий.
2. Установите зависимости, используя npm install.
3. Создайте файл .env в корне проекта для хранения переменных окружения, таких как строка подключения к MongoDB.
4. Запустите сервер, используя npm start.
