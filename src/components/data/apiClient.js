const apiCallAsync = async (url, init) => {
  try {
    const res = await fetch(url, init);
    const body = await res.json();
    if (res.status === 200) {
      return { success: true, message: body.result };
    } else {
      return { success: false, error: body.error };
    }
  } catch (e) {
    return { success: false, error: e };
  }
};

const ApiClient = {
  async deletePathAsync(project, path, confirmation) {
    const search = confirmation ? "?confirmation=" + encodeURIComponent(confirmation) : "";
    return apiCallAsync(`/api/project/${project}/data/${path}${search}`, {
      method: "DELETE"
    });
  },

  async deletePathsAsync(project, paths) {
    return apiCallAsync(`/api/project/${project}/data-bulk/delete`, {
      method: "POST",
      body: JSON.stringify(paths),
      headers: { "content-type": "application/json" }
    });
  },

  async updateDocumentFieldsAsync(project, path, fields) {
    return apiCallAsync(`/api/project/${project}/data/${path}`, {
      method: "PATCH",
      body: JSON.stringify(fields),
      headers: { "content-type": "application/json" }
    });
  },

  async createPathAsync(project, path, fields) {
    return apiCallAsync(`/api/project/${project}/data/${path}`, {
      method: "PUT",
      body: JSON.stringify(fields),
      headers: { "content-type": "application/json" }
    });
  }
};

export default ApiClient;
