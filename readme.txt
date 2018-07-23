get('/') : view.Jade
get('/:id'): view.Jade. id값에 해당하는 데이터 내용 보여줌
get('/add'): add.jade
  post('/add')
  redirect to ('/:id')
get('/:id/edit'): edit.Jade
  post('/:id/edit')
  redirect to ('/:id')
get('/:id/delete'): delete.Jade
  post('/:id/edit')
  redirect to ('/:id')
