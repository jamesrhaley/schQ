# schQ
  
[![Travis](https://img.shields.io/travis/jamesrhaley/schQ.svg)]()
[![Codecov](https://img.shields.io/codecov/c/github/jamesrhaley/schQ.svg)]()

a scheduler using [RxJS](https://github.com/Reactive-Extensions/RxJS)

### Install it
```
npm install schq
```

### Development

```
git clone clone https://github.com/jamesrhaley/schQ.git
cd schQ
npm install
$ npm run validate
```

### About:
schQ is an event scheduling pipeline that I’ve created to schedule d3 animations.  It can also be used for creating any type of sequence of operations that are held in an array.  As long as each part of your sequence can be listened on for completion, you can schQ it.

I created schQ to be able to abstract away all of my asynchronous programing so I could write simple declarative code when trying to design dynamic sequences of d3 transitions.  Most importantly I wished for this process to be independent so It could be used any where. schQ is a cycle of events that are triggered by event listeners that are waiting the events they have triggered to emit they are done.

schQ is dependent on [RxJS](https://github.com/Reactive-Extensions/RxJS)

You can see schQ in action in [grizzy](https://github.com/jamesrhaley/grizzy)

### Documentation:

[doc.esdoc.org/github.com/jamesrhaley/schQ](https://doc.esdoc.org/github.com/jamesrhaley/schQ)

