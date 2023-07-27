const express = require('express')
const app = express()
const path = require('path')

app.use(express.json());

//include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: 'b305b24d18cc406ea0f772bb9e4e77a7',
  captureUncaught: true,
  captureUnhandledRejections: true,
})
app.use(express.static(`public`))
// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    rollbar.info("user has entered my page")
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.warning("list of students was requested")
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           rollbar.info(`New Student ${name} has been added`)
           res.status(200).send(students)
       } else if (name === ''){
        rollbar.warning("Empty String was entered for a student")
           res.status(400).send('You must enter a name.')
       } else {
        rollbar.error("Duplicate name  was entered for a student")

           res.status(400).send('That student already exists.')
       }
   } catch (err) {
        rollbar.critical("Failed to add student")

       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
