import { defineStore } from 'pinia'
import { followUser, unfollowUser } from '@/api/user'

export const useFollowStore = defineStore('follow', {
  state: () => ({
    // { [userId]: true } 表示已关注
    following: {}
  }),
  getters: {
    isFollowing: (state) => (userId) => !!state.following[userId]
  },
  actions: {
    setFollowing(userId, value) {
      this.following[userId] = value
    },
    async follow(userId) {
      await followUser(userId)
      this.following[userId] = true
    },
    async unfollow(userId) {
      await unfollowUser(userId)
      this.following[userId] = false
    }
  }
})
