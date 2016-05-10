"use strict";

/**
 * User adapter module
 * @module lib/user-adapter
 */

/**
 * Interprets raw user data into usable functions
 * @class UserAdapter
 */
class UserAdapter {

  /**
   * Constructor
   * @func constructor
   * @param userData {Object} The current user info representation
   */
  constructor(userData) {
    this.userData = userData;
  }

  /**
   * Determines if the presenter user is anonymous 
   * @func isAnonymous
   */
  isAnonymous() {
    return (this.userData == null);
  }

  /** 
   * Gets the full name of the user
   * @func getName
   */
  getName() {
    
    if (this.isAnonymous()) {
      return null;
    }

    return this.userData['name'];

  }

  /**
   * Gets the email address of the user
   * @func getEmail
   */
  getEmail() {
    
    if (this.isAnonymous()) {
      return null;
    }

    return this.userData['email'];

  }

  /** 
   * Get crumbs party role id
   * @func getCrumbsPartyRoleId
   */
  getCrumbsPartyRoleId() {
    
    if (this.isAnonymous()) {
      return null;
    }

    return parseInt(this.userData['crumbs_party_role_id']);

  }

  /**
   * Get crumbs login id
   * @func getCrumbsLoginId
   */
   getCrumbsLoginId() {
    
    if (this.isAnonymous()) {
      return null;
    }

    return parseInt(this.userData['crumbs_login_id']);

   }

   /**
    * Get the role of the user
    * @func getRole 
    */
   getRole() {
    
    if (this.isAnonymous()) {
      return null;
    }

    return this.userData['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  }

}

module.exports.UserAdapter = UserAdapter;