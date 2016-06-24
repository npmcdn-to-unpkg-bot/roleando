
### Format

#### Tablas remotas
  * ;@usa => cabecera tablas remotas
  * nombre:id => grupo de tablas, ubicacion de almacenamiento, id de almacenamiento

#### Plantillas
  * ;@tpl|nombrePlantilla => indica que comienza una plantilla
  * [nombrePlantilla]  => indica que en lugar de una tabla, se reemplaza por una plantilla


#### Ideas

```

 RoleandoAPI.getTokenFromAuth() // > promise > token
 RoleandoAPI.setToken(token)


  // use generator

 RoleandoAPI.generators.load('a12354', { token, /* options */ }) // promise > gen

 const str = gen.generate('tpl_name', { markdown })


 // new generator

 const gen = RoleandoAPI.generators.create({ token })

 gen.addContent(str) // > promise.
 gen.addRemotes(remoteList) // > promise
 gen.reset() // > promise

 RoleandoAPI.generators.save(gen) // promise.


 // utils
 RoleandoAPI.generators.toRollTables(generator) // > object with generator keys and tables



```
