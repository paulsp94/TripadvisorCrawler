# Tripadvisor Crawler

This is a placeholder, later the data retrieved by the crawler will be presented here.
The data will be published after anonymisation and aggregation.


The crawler started multiple headless chrome instances over puppeteer to render the Tripadvisor website. Then puppeteer extracted the interesting data and the crawler packaged them in either a restaurant, review, or user object. This object then got handed over to the database handler which was implemented with mongoose. The database handler then wrote the objects into MongoDB. 

![Crawler data flow](./images/CrawlerGrafik.png "Crawler data flow")
