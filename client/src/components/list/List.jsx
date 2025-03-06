import './list.scss'
import Card from"../card/Card"

function List({posts, onDeleteProperty, isOwnerView = false}){
  
  const handleDelete = (postId) => {
    if (onDeleteProperty) {
      onDeleteProperty(postId);
    }
  };
  
  return (
    <div className='list'>
      <div className="statusLegend">
        <div className="legendItem">
          <span className="legendBadge availableBadge"></span>
          <span>Available</span>
        </div>
        <div className="legendItem">
          <span className="legendBadge soldBadge"></span>
          <span>Sold</span>
        </div>
        <div className="legendItem">
          <span className="legendBadge occupiedBadge"></span>
          <span>Occupied</span>
        </div>
      </div>
      {posts.map(item=>(
        <Card 
          key={item.id} 
          item={item} 
          onDelete={handleDelete}
          isOwnerView={isOwnerView}
        />
      ))}
    </div>
  )
}

export default List