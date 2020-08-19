const express = require('express');
const router = express.Router();
const request = require('request');
const db = require('../models');
const passport = require('../config/ppConfig');
const axios = require('axios')
const querystring = require('querystring');
const { response } = require('express');
let buff = new Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
let authKey = buff.toString('base64');

router.get('/', (req, res)=>{
    axios.post('https://accounts.spotify.com/api/token', 
        querystring.stringify({
            grant_type: 'client_credentials',
        }),
        {
            headers: {
                Authorization: `Basic ${authKey}`
           } 
           
    }).then((response)=>{                    
        token = response.data.access_token
        const config ={
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
        let composer = req.query.composer
        let track = req.query.track
        let query = encodeURIComponent(`${composer} ${track}`)
        axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist,track&offset=0&limit=20`, config)
        .then((response)=>{                    
            console.log(response.data)
            let tracks = response.data.tracks.items
            res.render('trackResults', {tracks})
          })
          .catch(err =>{
            console.log(err)
          })
       //use search query in here'
        console.log(token)
        
      })
    .catch(err=>{
        console.log("error", err.message)
    })
})

router.get('/:id', (req, res)=>{
    // console.log(req.params)
    axios.post('https://accounts.spotify.com/api/token',
    querystring.stringify({
        grant_type: 'client_credentials',
    }),
    {
        headers: {
            Authorization: `Basic ${authKey}`
       } 
       
    }).then((response)=>{                    
        let token = response.data.access_token
        const config ={
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
        console.log(req.params)
        if(req.params.id === '[object Object]'){
            console.log('this is wrong')
        }else{
            console.log(req.params.id)
        }
        let trackId = req.params.id
        // console.log('line 68', trackId)
        try{
            
            axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, config)
                .then((response)=> {
            console.log('line 71', response.data.album.images[0])
            let result = response.data
            console.log(result)
            // console.log(result.album.images[0])
            res.render('trackDetails', {result} )
            }).catch(err=>{
                // console.log('error', err)
            })
        }catch{
            console.log('this')
        }
    })
})
router.get('/', (req, res)=> {
    db.track.findAll()
    .then(response =>{
        res.render('profile', {response})
    })
})

router.post('/', (req, res) => {
    console.log('line 101', req.body)
    db.track.findOrCreate({
        where: {name: req.body.name },
         defaults: {trackid: req.body.trackId}
    })
    .then(([response, created]) => {
            res.redirect('profile');
            
            
    })
    .catch(err =>{
        console.log('error', err);
        res.send('sorry nodata');
    })
}) 
// var options = {
    //   'method': 'GET',
    //   'url': 'https://api.spotify.com/v1/search?query=beethoven&type=artist&offset=0&limit=20',
    //   'headers': {
        //     'Authorization': 'Bearer BQC8yadbNZt4N-18ItdDmfgqgpOX2Rp2mPTiSI531AuxJTncRVGEL_uNkWpi9naKl9Z5cPgBNe7SenC49TY'
//   }
// };
// request(options, function (error, response) {
//   if (error) throw new Error(error);
//   console.log(response.body);
// });
module.exports =router

  
  