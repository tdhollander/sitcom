Rails.application.routes.draw do

  # Devise

  devise_for :users, controllers: {
    sessions:  'users/sessions',
    passwords: 'users/passwords'
  }

  # App

  resources :contacts

  resource :profile do
    resource :password
  end

  # Root

  root to: 'contacts#index'
  post '/' => 'contacts#index'

  # Admin

  # API

end
