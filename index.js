const express = require('express')
const app = express()
const morgan = require('morgan')
require('dotenv').config()

const cors = require('cors')
const Person = require('./models/person')
app.use(express.static('dist')) // 1
app.use(express.json()) // 2
app.use(morgan('tiny'))
app.use(cors())

morgan.token('req-body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(
  morgan(
    'method :url :status :res[content-length] - :response-time ms :req-body'
  )
)

/* let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
] */

/* Front page */
// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })
/* Info page */
app.get('/info', (request, response) => {
  const qtyPersons = Person.length
  
  const today = new Date
  response.send(
    `
    <p>Phonebook has info for ${qtyPersons} people</p>
    <p>${today}</p>
    `
  )
})
/* All persons */
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})

// const generateId = (min, max) => {
//   return Math.floor(Math.random() * (max - min) + min)
// }

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    {name, number},
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

// app.post('/api/persons', (request, response) => {
//   const body = request.body

//   if (!body.name) {
//     return response.status(400).json({ 
//       error: 'name missing' 
//     })
//   }

//   if (!body.number) {
//     return response.status(400).json({
//       error: 'number missing'
//     })
//   }

//   if (persons.map(person =>person.name).includes(body.name)) {
//     return response.status(400).json({
//       error: 'name must be unique'
//     })
//   }

//   const person = {
//     name: body.name,
//     number: body.number,
//     id: generateId(0, 10000),
//   }

//   persons = persons.concat(person)

//   response.json(person)
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
