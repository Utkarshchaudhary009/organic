"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useStore } from "@/lib/tanstack";
import { supabase } from "@/lib/tanstack/supabase";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

interface FooterLink {
  title: string;
  url: string;
  category: "quick_links" | "information";
}

interface FooterSocialMedia {
  platform: string;
  url: string;
  icon: string;
}

export default function FooterSettingsPage() {
  const router = useRouter();
  const { data: storeData, isLoading, refetch } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    contact_email: "",
    contact_phone: "",
    address: "",
    social_links: {},
    footer_links: [] as FooterLink[],
    newsletter_enabled: true,
  });



  // Load store data
  useEffect(() => {
    if (storeData) {
      setFormData({
        contact_email: storeData.contact_email || "",
        contact_phone: storeData.contact_phone || "",
        address: storeData.address || "",
        social_links: storeData.social_links || {},
        footer_links: storeData.footer_links || [],
        newsletter_enabled: storeData.newsletter_enabled !== false,
      });
    }
  }, [storeData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSocialMediaChange = (platform: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url,
      },
    }));
  };

  const handleLinkChange = (
    index: number,
    field: keyof FooterLink,
    value: string
  ) => {
    setFormData((prev) => {
      const newLinks = [...prev.footer_links];
      newLinks[index] = {
        ...newLinks[index],
        [field]: value,
      };
      return {
        ...prev,
        footer_links: newLinks,
      };
    });
  };

  const addLink = (category: "quick_links" | "information") => {
    setFormData((prev) => ({
      ...prev,
      footer_links: [...prev.footer_links, { title: "", url: "", category }],
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      footer_links: prev.footer_links.filter((_, i) => i !== index),
    }));
  };

  const saveSettings = async () => {
    if (!storeData?.id) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("store")
        .update({
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          address: formData.address,
          social_links: formData.social_links,
          footer_links: formData.footer_links,
          newsletter_enabled: formData.newsletter_enabled,
        })
        .eq("id", storeData.id);

      if (error) throw error;

      // Refetch store data
      await refetch();

      alert("Footer settings saved successfully!");
    } catch (error) {
      console.error("Error saving footer settings:", error);
      alert("Failed to save footer settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading ) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-green-600' />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Footer Settings</h1>

      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Contact Information */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>Contact Information</h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Email Address
                </label>
                <input
                  type='email'
                  name='contact_email'
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Phone Number
                </label>
                <input
                  type='text'
                  name='contact_phone'
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Address
                </label>
                <textarea
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>Social Media</h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Facebook URL
                </label>
                <input
                  type='url'
                  value={(formData.social_links as any)?.facebook || ""}
                  onChange={(e) =>
                    handleSocialMediaChange("facebook", e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Twitter URL
                </label>
                <input
                  type='url'
                  value={(formData.social_links as any)?.twitter || ""}
                  onChange={(e) =>
                    handleSocialMediaChange("twitter", e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Instagram URL
                </label>
                <input
                  type='url'
                  value={(formData.social_links as any)?.instagram || ""}
                  onChange={(e) =>
                    handleSocialMediaChange("instagram", e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  YouTube URL
                </label>
                <input
                  type='url'
                  value={(formData.social_links as any)?.youtube || ""}
                  onChange={(e) =>
                    handleSocialMediaChange("youtube", e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Footer Links</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Quick Links */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-medium'>Quick Links</h3>
                <button
                  type='button'
                  onClick={() => addLink("quick_links")}
                  className='flex items-center text-sm text-green-600 hover:text-green-700'
                >
                  <Plus
                    size={16}
                    className='mr-1'
                  />{" "}
                  Add Link
                </button>
              </div>

              <div className='space-y-3'>
                {formData.footer_links
                  .filter((link) => link.category === "quick_links")
                  .map((link, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='text'
                        placeholder='Title'
                        value={link.title}
                        onChange={(e) =>
                          handleLinkChange(
                            formData.footer_links.indexOf(link),
                            "title",
                            e.target.value
                          )
                        }
                        className='flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                      />
                      <input
                        type='text'
                        placeholder='URL'
                        value={link.url}
                        onChange={(e) =>
                          handleLinkChange(
                            formData.footer_links.indexOf(link),
                            "url",
                            e.target.value
                          )
                        }
                        className='flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          removeLink(formData.footer_links.indexOf(link))
                        }
                        className='p-2 text-red-500 hover:text-red-700'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Information Links */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='font-medium'>Information</h3>
                <button
                  type='button'
                  onClick={() => addLink("information")}
                  className='flex items-center text-sm text-green-600 hover:text-green-700'
                >
                  <Plus
                    size={16}
                    className='mr-1'
                  />{" "}
                  Add Link
                </button>
              </div>

              <div className='space-y-3'>
                {formData.footer_links
                  .filter((link) => link.category === "information")
                  .map((link, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='text'
                        placeholder='Title'
                        value={link.title}
                        onChange={(e) =>
                          handleLinkChange(
                            formData.footer_links.indexOf(link),
                            "title",
                            e.target.value
                          )
                        }
                        className='flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                      />
                      <input
                        type='text'
                        placeholder='URL'
                        value={link.url}
                        onChange={(e) =>
                          handleLinkChange(
                            formData.footer_links.indexOf(link),
                            "url",
                            e.target.value
                          )
                        }
                        className='flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          removeLink(formData.footer_links.indexOf(link))
                        }
                        className='p-2 text-red-500 hover:text-red-700'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Settings */}
        <div className='mt-8'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='newsletter_enabled'
              name='newsletter_enabled'
              checked={formData.newsletter_enabled}
              onChange={handleToggleChange}
              className='h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded'
            />
            <label
              htmlFor='newsletter_enabled'
              className='ml-2 block text-sm'
            >
              Enable Newsletter Section
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className='mt-8 flex justify-end'>
          <button
            type='button'
            onClick={saveSettings}
            disabled={isSaving}
            className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
          >
            {isSaving ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' /> Saving...
              </>
            ) : (
              <>
                <Save className='h-4 w-4 mr-2' /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
