'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '@/lib/api';
import css from './NoteForm.module.css';
import type { NoteTag } from '@/types/note';

interface NoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be at most 50 characters')
    .required('Title is required'),
  content: Yup.string()
    .max(500, 'Content must be at most 500 characters'),
  tag: Yup.string()
    .oneOf(['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'], 'Invalid tag')
    .required('Tag is required'),
});

export default function NoteForm({ onSuccess, onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      onSuccess();
    },
  });

  const initialValues = {
    title: '',
    content: '',
    tag: 'Personal' as NoteTag,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        createNoteMutation.mutate(values, {
          onSettled: () => {
            setSubmitting(false);
          },
        });
      }}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <h2 className={css.title}>Create New Note</h2>
          
          <div className={css.formGroup}>
            <label htmlFor="title" className={css.label}>Title</label>
            <Field
              id="title"
              name="title"
              type="text"
              className={css.input}
              placeholder="Note title"
              disabled={isSubmitting || createNoteMutation.isPending}
            />
            <ErrorMessage name="title" component="div" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content" className={css.label}>Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              className={css.textarea}
              placeholder="Note content"
              disabled={isSubmitting || createNoteMutation.isPending}
            />
            <ErrorMessage name="content" component="div" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag" className={css.label}>Tag</label>
            <Field
              as="select"
              id="tag"
              name="tag"
              className={css.select}
              disabled={isSubmitting || createNoteMutation.isPending}
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Todo">Todo</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </Field>
            <ErrorMessage name="tag" component="div" className={css.error} />
          </div>

           <div className={css.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={css.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}