import { config, collection, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

export default config({
  storage: { kind: 'local' },
  collections: {
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Published', validation: { isRequired: true } }),
        updatedDate: fields.date({ label: 'Updated' }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    feed: collection({
      label: 'Feed',
      slugField: 'text',
      path: 'src/content/feed/*',
      format: { contentField: 'content' },
      schema: {
        // ponytail: body is unused by the site; exists only so Keystatic writes .md
        content: fields.markdoc({ label: 'Content', extension: 'md' }),
        text: fields.slug({ name: { label: 'Text' } }),
        type: fields.select({
          label: 'Type',
          options: [{ label: 'Post', value: 'post' }],
          defaultValue: 'post',
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        url: fields.url({ label: 'URL' }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
      },
    }),
    travels: collection({
      label: 'Travels',
      slugField: 'title',
      path: 'src/content/travels/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Place' } }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        lat: fields.number({ label: 'Latitude', validation: { isRequired: true } }),
        lng: fields.number({ label: 'Longitude', validation: { isRequired: true } }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.mdx({
          label: 'Content',
          options: { image: { directory: 'public/travels', publicPath: '/travels' } },
          components: {
            Figure: block({
              label: 'Figure',
              schema: {
                photos: fields.array(
                  fields.object({
                    src: fields.image({
                      label: 'Image',
                      directory: 'public/travels',
                      publicPath: '/travels',
                      validation: { isRequired: true },
                    }),
                    caption: fields.text({ label: 'Caption' }),
                  }),
                  {
                    label: 'Photos',
                    itemLabel: (props) => props.fields.caption.value || 'Photo',
                  }
                ),
              },
            }),
          },
        }),
      },
    }),
  },
});
