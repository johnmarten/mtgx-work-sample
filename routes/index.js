'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');

const path = '/web-se/film/';
const viaplayUrl = 'https://content.viaplay.se';
const traileraddictUrl = 'http://api.traileraddict.com/';

function fetchData(url, success, failure) {
  request.get(url, (error, res, body) => {
    if (!error && res.statusCode === 200) {
      success(body);
    } else {
      failure(error);
    }
  });
}

function parseJSON(string) {
  let json;

  try {
    json = JSON.parse(string);
  } catch (SyntaxError) {
    return {};
  }

  if (json["_embedded"]) {
    return {
      id: json["_embedded"]["viaplay:blocks"][0]["_embedded"]["viaplay:product"]["content"]["imdb"]["id"].match(/\d+/)[0]
    };
  } else {
    return {};
  }
}

router.get(`${path}:name`, (req, res, next) => {
  fetchData(`${viaplayUrl}${path}${req.params.name}`, (body) => {
    const result = parseJSON(body);
    fetchData(`${traileraddictUrl}?imdb=${result.id}&count=1&width=680`, (body) => {
      res.render('index', {result: body});
    }, (err) => {
      next(err);
    });

  }, (err) => {
    next(err);
  });
});

module.exports = router;
