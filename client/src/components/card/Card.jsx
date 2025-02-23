import { Link } from "react-router-dom";
import "./card.scss";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function Card({ item, onDelete, isOwnerView = false }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [propertyStatus, setPropertyStatus] = useState(item.status || 'available');
  const { currentUser } = useContext(AuthContext);
  
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };
  
  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await apiRequest.delete(`/posts/${item.id}`);
      setShowConfirm(false);
      if (onDelete) onDelete(item.id);
    } catch (err) {
      console.error("Error deleting property:", err);
    }
  };
  
  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const handleStatusClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStatusDropdown(!showStatusDropdown);
  };

  const updatePropertyStatus = async (newStatus) => {
    try {
      // Immediately update UI for better user experience
      setPropertyStatus(newStatus);
      setShowStatusDropdown(false);
      
      console.log(`Updating property ${item.id} status to: ${newStatus}`);
      
      // Only send the status field to update
      const response = await apiRequest.put(`/posts/${item.id}`, { 
        status: newStatus 
      });
      
      console.log("Update response:", response.data);
      
      // Success - show confirmation but don't reload the page
      alert(`Property status updated to ${newStatus}`);
      
      // Instead of full page reload, we can just keep the updated status
      // This gives better user experience
      // window.location.reload();
    } catch (err) {
      // On error, revert UI change and show error
      setPropertyStatus(item.status || 'available');
      console.error("Error updating property status:", err);
      
      // More detailed error message
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      console.error("Error details:", errorMsg);
      
      alert(`Failed to update property status: ${errorMsg}`);
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    // If clicking outside the dropdown menu but not on the status icon
    if (
      showStatusDropdown && 
      e.target.closest('.dropdownMenu') === null && 
      e.target.closest('.statusIcon') === null
    ) {
      e.preventDefault();
      e.stopPropagation();
      setShowStatusDropdown(false);
    }
  };

  // Add event listener on mount, remove on unmount
  useEffect(() => {
    if (showStatusDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const isOwner = currentUser?.id === item.userId;
  
  // Determine property status display
  const getStatusBadge = () => {
    // Use local state to allow for immediate UI update
    const status = propertyStatus;
    const isForRent = item.type === 'rent';
    
    if (status === 'sold') {
      return <div className="statusBadge soldBadge">SOLD</div>;
    } else if (status === 'occupied' && isForRent) {
      return <div className="statusBadge occupiedBadge">OCCUPIED</div>;
    } else if (isForRent) {
      return <div className="statusBadge availableBadge">FOR RENT</div>;
    } else {
      return <div className="statusBadge availableBadge">FOR SALE</div>;
    }
  };
  
  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt="" />
        {getStatusBadge()}
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>
            {item.title}
            {/* Mobile-friendly status badge */}
            <span className={`statusBadgeSmall ${propertyStatus === 'sold' ? 'soldBadge' : propertyStatus === 'occupied' ? 'occupiedBadge' : 'availableBadge'}`}>
              {propertyStatus === 'sold' ? 'SOLD' : 
               propertyStatus === 'occupied' ? 'OCCUPIED' : 
               item.type === 'rent' ? 'RENT' : 'SALE'}
            </span>
          </Link>
        </h2>
        <div className="propertyInfo">
          <p className="address">
            <img src="/pin.png" alt="" />
            <span>{item.address}</span>
          </p>
          <div className="city">
            <img src="/city.png" alt="" />
            <span>{item.city}</span>
          </div>
          <h2>{item.property}</h2>
          <p className="price">Rs. {item.price}</p>
        </div>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            {isOwnerView && isOwner && (
              <>
                <div className="icon statusIcon" onClick={handleStatusClick}>
                  <img src="/pet.png" alt="Status" title="Update status" />
                </div>
                <div className="icon deleteIcon" onClick={handleDeleteClick}>
                  <img src="/menu.png" alt="Delete" title="Delete property" />
                </div>
              </>
            )}
            <div className="icon">
              <img src="/save.png" alt="" />
            </div>
            <div className="icon">
              <img src="/chat.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      
      {showConfirm && (
        <div className="deleteConfirm">
          <div className="confirmDialog">
            <p>Are you sure you want to delete this property?</p>
            <div className="confirmButtons">
              <button className="yesBtn" onClick={handleConfirmDelete}>Yes</button>
              <button className="noBtn" onClick={handleCancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
      
      {showStatusDropdown && isOwnerView && isOwner && (
        <div className="statusDropdown" onClick={(e) => e.stopPropagation()}>
          <div className="dropdownMenu" onClick={(e) => e.stopPropagation()}>
            <h4>Update Property Status</h4>
            <ul>
              {item.type === 'rent' ? (
                <>
                  <li 
                    onClick={() => updatePropertyStatus('available')}
                    className={propertyStatus === 'available' ? 'active' : ''}
                  >
                    Available for Rent
                  </li>
                  <li 
                    onClick={() => updatePropertyStatus('occupied')}
                    className={propertyStatus === 'occupied' ? 'active' : ''}
                  >
                    Occupied
                  </li>
                </>
              ) : (
                <>
                  <li 
                    onClick={() => updatePropertyStatus('available')}
                    className={propertyStatus === 'available' ? 'active' : ''}
                  >
                    Available for Sale
                  </li>
                  <li 
                    onClick={() => updatePropertyStatus('sold')}
                    className={propertyStatus === 'sold' ? 'active' : ''}
                  >
                    Sold
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;