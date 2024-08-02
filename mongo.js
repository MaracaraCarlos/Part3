const mongoose = require('mongoose')

const password = process.argv[2]
const namePerson = process.argv[3]
const numberPerson = process.argv[4]

const url =
`mongodb+srv://Cems2009:${password}@cluster0.4ydsqfv.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: namePerson,
  number: numberPerson,
})

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)

} else if (process.argv.length==3) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })

} else if (process.argv.length>3) {
  person.save().then(result => {
    console.log(`added ${namePerson} number ${numberPerson} to phonebook`)
    mongoose.connection.close()
  })
}