# selfloc

generates a stream of random digits and highlights where the index and digits match (a la https://www.youtube.com/watch?v=W20aT14t8Pw)

for instance:

```
stream: 5435109251038491623049810298341...
          ^      ^^    ^^
index:    3      10    16
```

## running

```bash
git clone https://github.com/stripedpajamas/selfloc.git
cd selfloc
npm install
node .
```

it doesn't handle the highlighting too well when there are matches within the same 16-digit block

## license
MIT