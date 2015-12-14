'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const parseString = require('xml2js').parseString;

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
    return json["_embedded"]["viaplay:blocks"][0]["_embedded"]["viaplay:product"];
  } else {
    return {};
  }
}

router.get(`${path}:name`, (req, res, next) => {
  fetchData(`${viaplayUrl}${path}${req.params.name}`, (body) => {

    const viaplayProduct = parseJSON(body);
    const content = viaplayProduct.content;
    const systemFlags = viaplayProduct.system.flags;
    const id = content.imdb.id.match(/\d+/)[0];

    fetchData(`${traileraddictUrl}?imdb=${id}&count=1&width=680&credit=no`, (body) => {

      parseString(body, (err, result) => {
        res.render('index', {
          embed: result.trailers.trailer[0].embed,
          imdb: content.imdb,
          duration: content.duration,
          parentalRating: content.parentalRating,
          actors: content.people.actors,
          directors: content.people.directors,
          production: content.production,
          synopsis: content.synopsis,
          title: content.title,
          genres: viaplayProduct["_links"]["viaplay:genres"],
          hd: systemFlags[0] === 'hd' || systemFlags[1] === 'hd'
        });
      });
    }, (err) => {
      next(err);
    });

  }, (err) => {
    next(err);
  });
});

module.exports = router;
