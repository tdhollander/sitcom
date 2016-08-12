class Contact < ApplicationRecord

  # Concerns

  include CommonIndexConcern
  include ContactIndexConcern

  # Associations

  belongs_to :lab

  has_many :contact_organization_links, :dependent => :destroy
  has_many :organizations, :through => :contact_organization_links

  has_many :contact_field_links, :dependent => :destroy
  has_many :fields, :through => :contact_field_links

  has_many :contact_event_links, :dependent => :destroy
  has_many :events, :through => :contact_event_links

  has_many :contact_project_links, :dependent => :destroy
  has_many :projects, :through => :contact_project_links

  has_many :notes, :as => :notable

  # Validations

  validates :name, :presence => { :message => "Le nom est obligatoire."  }

  # Methods

  def name
    [first_name, last_name].join(' ')
  end

  def address(html = false)
    separator = html ? '<br />' : "\n"
    [address_street, address_zip_code, address_city, address_country].reject(&:blank?).join(separator)
  end
end
